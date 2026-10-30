/* Hjuviks Marina – rörelser (GSAP).
 * Tre motiverade moment:
 * 1. Heron: rubriken reser sig rad för rad när sidan öppnas.
 * 2. Citatet: orden får full färg i läsfart medan man scrollar.
 * 3. Bilder: öppnar sig när de kommer in i bild.
 * Allt stängs av vid "minska rörelse". */
(function () {
	'use strict';

	if (!window.gsap || !window.ScrollTrigger || !window.SplitText) {
		return;
	}

	gsap.registerPlugin(ScrollTrigger, SplitText);

	var hero = document.querySelector('.elementor header:has(h1)');
	var h1 = hero ? hero.querySelector('h1') : null;

	if (hero) {
		hero.classList.add('hjd-hero');
	}

	function citatRubrik() {
		var kandidater = document.querySelectorAll('.elementor section h2');
		for (var i = 0; i < kandidater.length; i++) {
			var t = kandidater[i].textContent.trim();
			if (t.charAt(0) === '”' || t.charAt(0) === '“' || t.charAt(0) === '"') {
				return kandidater[i];
			}
		}
		return null;
	}

	function start() {
		var mm = gsap.matchMedia();

		mm.add('(prefers-reduced-motion: no-preference)', function () {
			// 1. Hero
			if (h1) {
				SplitText.create(h1, {
					type: 'lines',
					mask: 'lines',
					linesClass: 'hjd-line',
					autoSplit: true,
					onSplit: function (self) {
						gsap.set(h1, { visibility: 'visible' });
						return gsap.from(self.lines, {
							yPercent: 112,
							duration: 1.15,
							ease: 'expo.out',
							stagger: 0.09,
						});
					},
				});

				var resten = [];
				var inre = h1.parentElement;
				Array.prototype.forEach.call(inre.children, function (el) {
					if (el !== h1) {
						resten.push(el);
					}
				});
				var legend = hero.querySelectorAll('.e-grid-base > *');
				gsap.from(resten, { y: 22, autoAlpha: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, delay: 0.35 });
				if (legend.length) {
					gsap.from(legend, { y: 14, autoAlpha: 0, duration: 0.8, ease: 'power3.out', stagger: 0.06, delay: 0.6 });
				}
			}

			// 2. Citatet läses fram i scrollfart
			var citat = citatRubrik();
			if (citat) {
				var ord = SplitText.create(citat, { type: 'words', wordsClass: 'hjd-ord' });
				gsap.fromTo(ord.words, { opacity: 0.16 }, {
					opacity: 1,
					ease: 'none',
					stagger: 0.12,
					scrollTrigger: {
						trigger: citat,
						start: 'top 78%',
						end: 'bottom 42%',
						scrub: 0.6,
					},
				});
			}

			// 3. Bilder öppnar sig
			var bilder = document.querySelectorAll('.elementor section img.e-image-base');
			Array.prototype.forEach.call(bilder, function (img) {
				gsap.fromTo(img, { clipPath: 'inset(14% 8% 14% 8%)', scale: 1.08 }, {
					clipPath: 'inset(0% 0% 0% 0%)',
					scale: 1,
					duration: 1.5,
					ease: 'expo.out',
					scrollTrigger: {
						trigger: img,
						start: 'top 86%',
						once: true,
					},
				});
			});
		});

		mm.add('(prefers-reduced-motion: reduce)', function () {
			if (h1) {
				gsap.set(h1, { visibility: 'visible' });
			}
		});

		window.addEventListener('load', function () {
			ScrollTrigger.refresh();
		});
	}

	if (document.fonts && document.fonts.ready) {
		document.fonts.ready.then(start);
	} else {
		start();
	}
})();
