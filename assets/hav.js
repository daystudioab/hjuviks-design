/* Hjuviks Marina – havsyta i startsidans hero (Three.js).
 * En lugn havsyta sedd från bryggan, med horisonten strax ovanför
 * bild: långsamma dyningar, himmel som speglas i vattnet och solglitter.
 * Ingen raymarching – varje pixel räknar ut var blicken träffar
 * vattenplanet och tar normalen från en summa av vågor. */
import * as THREE from './vendor/three.module.min.js';

const hero = document.querySelector('.elementor header:has(h1)');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function webglOk() {
	try {
		const c = document.createElement('canvas');
		return !!(c.getContext('webgl2') || c.getContext('webgl'));
	} catch (e) {
		return false;
	}
}

if (hero && webglOk()) {
	hero.classList.add('hjd-hero');

	const canvas = document.createElement('canvas');
	canvas.className = 'hjd-hav';
	canvas.setAttribute('aria-hidden', 'true');
	hero.prepend(canvas);

	const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'low-power' });
	renderer.outputColorSpace = THREE.SRGBColorSpace;

	const scene = new THREE.Scene();
	const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
	const col = (hex) => new THREE.Color(hex);

	const uniforms = {
		uTime: { value: 0 },
		uRes: { value: new THREE.Vector2(1, 1) },
		uBox: { value: new THREE.Vector4(0.0, 0.1, 0.5, 0.75) },
		uZenit: { value: col('#1466D2') },
		uHorisont: { value: col('#7FC2F0') },
		uDjup: { value: col('#002A5E') },
		uSpridning: { value: col('#0A8BD8') },
		uMaxVagor: { value: 22 },
		uSol: { value: col('#FFF4DC') },
	};

	const material = new THREE.ShaderMaterial({
		uniforms,
		vertexShader: /* glsl */ `
			void main() {
				gl_Position = vec4(position.xy, 0.0, 1.0);
			}
		`,
		fragmentShader: /* glsl */ `
			precision highp float;
			uniform float uTime;
			uniform vec2 uRes;
			uniform vec4 uBox;
			uniform vec3 uZenit;
			uniform vec3 uHorisont;
			uniform vec3 uDjup;
			uniform vec3 uSpridning;
			uniform vec3 uSol;
			uniform int uMaxVagor;

			#define VAGOR 22
			#define HORISONT 0.60

			// En våg med skarpare krön än en sinus (exp(sin)).
			vec2 vag(vec2 p, vec2 riktning, float frekvens, float fas) {
				float x = dot(riktning, p) * frekvens + fas;
				float w = exp(sin(x) - 1.0);
				return vec2(w, -w * cos(x));
			}

			float hojd(vec2 p, int antal) {
				float iter = 0.0;
				float frekvens = 1.0;
				float tid = 1.0;
				float vikt = 1.0;
				float summa = 0.0;
				float vikter = 0.0;
				for (int i = 0; i < VAGOR; i++) {
					if (i >= antal) break;
					vec2 r = vec2(sin(iter), cos(iter));
					vec2 v = vag(p, r, frekvens, uTime * tid);
					p += r * v.y * vikt * 0.38;
					summa += v.x * vikt;
					vikter += vikt;
					vikt = mix(vikt, 0.0, 0.2);
					frekvens *= 1.18;
					tid *= 1.07;
					iter += 1232.399963;
				}
				return summa / vikter;
			}

			// Normal (xyz) och normaliserad våghöjd (w).
			vec4 normal(vec2 p, float e, float djup, int antal) {
				float h0 = hojd(p, antal);
				vec3 a = vec3(p.x, h0 * djup, p.y);
				vec3 b = vec3(p.x - e, hojd(p - vec2(e, 0.0), antal) * djup, p.y);
				vec3 c = vec3(p.x, hojd(p + vec2(0.0, e), antal) * djup, p.y + e);
				return vec4(normalize(cross(a - b, a - c)), h0);
			}

			vec3 himmel(vec3 d, vec3 sol) {
				float y = max(d.y, 0.0);
				vec3 c = mix(uHorisont, uZenit, pow(y, 0.45));
				float s = max(dot(d, sol), 0.0);
				c += uSol * (pow(s, 6.0) * 0.08 + pow(s, 64.0) * 0.3);
				return c;
			}

			void main() {
				vec2 uv = gl_FragCoord.xy / uRes;
				vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;

				// Sedd från bryggan, men horisonten ligger strax ovanför heron – bara vatten syns.
				vec3 rd = normalize(vec3(p.x, p.y - HORISONT, 1.35));
				vec3 ro = vec3(uTime * 0.02, 2.2 + sin(uTime * 0.11) * 0.04, uTime * 0.12);
				vec3 sol = normalize(vec3(0.5, 0.16, 1.0));

				vec3 c;
				{
					float t = -ro.y / rd.y;
					vec2 xz = ro.xz + rd.xz * t;
					vec2 q = xz * 0.32;

					// Färre vågor och mjukare normaler längre bort.
					float avst = clamp(t / 90.0, 0.0, 1.0);
					int antal = int(mix(float(uMaxVagor), 8.0, avst));
					vec4 nh = normal(q, 0.01 + t * 0.0015, 0.42, antal);
					vec3 n = normalize(mix(nh.xyz, vec3(0.0, 1.0, 0.0), smoothstep(0.0, 1.0, avst) * 0.85));

					float fresnel = 0.03 + 0.97 * pow(1.0 - max(dot(n, -rd), 0.0), 5.0);
					vec3 r = reflect(rd, n);
					r.y = abs(r.y);

					float h = nh.w;
					vec3 vatten = uDjup + uSpridning * (0.18 + 0.55 * pow(h, 2.0)) * (1.0 - avst * 0.6);
					c = mix(vatten, himmel(r, sol) * 0.62, fresnel * 0.55);

					// Solglitter.
					float glitter = pow(max(dot(r, sol), 0.0), 900.0);
					c += uSol * glitter * 1.8;

					// Dis längst bort – mot vattnets egen blå, så att ingen ljus horisontlinje bildas.
					float dis = 1.0 - exp(-t * 0.012);
					c = mix(c, mix(uDjup, uSpridning, 0.55), dis * 0.6);
				}

				// Mörkare där texten står, mot nederkanten och upptill bakom menyn.
				vec2 ut = vec2(max(max(uBox.x - uv.x, uv.x - uBox.z), 0.0), max(max(uBox.y - uv.y, uv.y - uBox.w), 0.0));
				ut.y *= uRes.y / uRes.x;
				float iText = 1.0 - smoothstep(0.0, 0.22, length(ut));
				float skugga = iText * 0.52 + smoothstep(0.4, 0.0, uv.y) * 0.38 + smoothstep(0.78, 1.0, uv.y) * 0.5;
				c = mix(c, c * vec3(0.38, 0.55, 0.82), clamp(skugga, 0.0, 0.78));

				// Klarare blått: lyft mättnaden något.
				float lum = dot(c, vec3(0.2126, 0.7152, 0.0722));
				c = max(mix(vec3(lum), c, 1.28), 0.0);

				gl_FragColor = vec4(c, 1.0);
				#include <colorspace_fragment>
			}
		`,
	});

	scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

	// Läs av var rubrik, ingress och knappar står, så att havet mörknar där.
	function textBox() {
		const h1 = hero.querySelector('h1');
		if (!h1 || !h1.parentElement) {
			return;
		}
		const hr = hero.getBoundingClientRect();
		let minX = Infinity;
		let minY = Infinity;
		let maxX = -Infinity;
		let maxY = -Infinity;
		Array.prototype.forEach.call(h1.parentElement.children, (el) => {
			const r = el.getBoundingClientRect();
			let right = r.right;
			if (el === h1) {
				const range = document.createRange();
				range.selectNodeContents(h1);
				right = Math.min(r.right, range.getBoundingClientRect().right);
			}
			minX = Math.min(minX, r.left);
			maxX = Math.max(maxX, right);
			minY = Math.min(minY, r.top);
			maxY = Math.max(maxY, r.bottom);
		});
		if (!isFinite(minX) || hr.width === 0) {
			return;
		}
		uniforms.uBox.value.set(
			(minX - hr.left) / hr.width,
			1 - (maxY - hr.top) / hr.height,
			(maxX - hr.left) / hr.width,
			1 - (minY - hr.top) / hr.height
		);
	}

	function resize() {
		const w = hero.clientWidth;
		const h = hero.clientHeight;
		// Begränsa antalet pixlar som räknas, särskilt på mobil och stora skärmar.
		let pr = Math.min(window.devicePixelRatio || 1, 1.5);
		const liten = w < 768;
		uniforms.uMaxVagor.value = liten ? 14 : 22;
		const maxPx = liten ? 0.8e6 : 1.6e6;
		if (w * h * pr * pr > maxPx) {
			pr = Math.max(0.5, Math.sqrt(maxPx / (w * h)));
		}
		renderer.setPixelRatio(pr);
		renderer.setSize(w, h, false);
		uniforms.uRes.value.set(w * pr, h * pr);
		textBox();
		if (reduce) {
			renderer.render(scene, camera);
		}
	}

	new ResizeObserver(resize).observe(hero);
	resize();
	if (document.fonts && document.fonts.ready) {
		document.fonts.ready.then(() => setTimeout(textBox, 1700));
	}

	let visible = true;
	new IntersectionObserver((entries) => {
		visible = entries[0].isIntersecting;
	}).observe(hero);

	const clock = new THREE.Clock();
	let started = false;

	// Tiden börjar en bit in så att havet redan rör sig när det tonar fram.
	uniforms.uTime.value = 12.0;

	function frame() {
		const dt = Math.min(clock.getDelta(), 0.05);
		if (visible && !document.hidden) {
			uniforms.uTime.value += dt * 0.55;
			renderer.render(scene, camera);
			if (!started) {
				started = true;
				canvas.classList.add('is-ready');
			}
		}
	}

	if (reduce) {
		renderer.render(scene, camera);
		canvas.classList.add('is-ready');
	} else {
		// Låt rubrikintrot få processorn först.
		setTimeout(() => {
			clock.getDelta();
			renderer.setAnimationLoop(frame);
		}, 900);
	}
}
