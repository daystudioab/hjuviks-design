/* Hjuviks Marina – rörelser (GSAP).
 * Tre motiverade moment:
 * 1. Heron: rubriken reser sig rad för rad när sidan öppnas.
 * 2. Citatet: orden får full färg i läsfart medan man scrollar.
 * 3. Bilder: öppnar sig när de kommer in i bild.
 * 4. Panorering i .hm-panorera-rutor.
 * 5. Textfyllnad: text med klassen hm-fyll är ljusgrå och fylls i ord för ord i scrollfart,
 *    stycken i samma block som en enda löpande text.
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
				var legend = Array.prototype.slice.call(hero.querySelectorAll('.e-grid-base > *'));
				// Elementors behållare har en CSS-övergång på transform som annars låser
				// GSAP-rörelsen halvvägs. Stäng av den under introt och städa efteråt.
				var utanOvergang = function (els) {
					els.forEach(function (el) {
						el.style.transition = 'none';
					});
				};
				var stada = { clearProps: 'transform,transition' };
				utanOvergang(resten);
				utanOvergang(legend);
				gsap.fromTo(resten, { y: 22, autoAlpha: 0 }, Object.assign({ y: 0, autoAlpha: 1, duration: 0.9, ease: 'power3.out', stagger: 0.08, delay: 0.35 }, stada));
				if (legend.length) {
					gsap.fromTo(legend, { y: 14, autoAlpha: 0 }, Object.assign({ y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out', stagger: 0.06, delay: 0.6 }, stada));
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
			var bilder = document.querySelectorAll('.elementor section img.e-image-base:not([src*="hjuviks-karta"])');
			bilder = Array.prototype.filter.call(bilder, function (img) {
				return !img.closest('.hm-panorera');
			});
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

		// 4. Panorering: en bild i en .hm-panorera-ruta glider långsamt så att rutan visar
		//    bilden från höger kant till vänster kant (35 s), och tillbaka. Mjuk in- och
		//    utbromsning i båda ändar. Bilder som är lika breda som rutan står still. Bilden är förankrad
		//    till höger i CSS, så utan JS eller med minska rörelse visas startbilden.
		mm.add('(prefers-reduced-motion: no-preference)', function () {
			Array.prototype.forEach.call(document.querySelectorAll('.hm-panorera'), function (ruta) {
				var img = ruta.querySelector('img');
				if (!img) {
					return;
				}
				var avstand = function () {
					return Math.max(0, img.getBoundingClientRect().width - ruta.getBoundingClientRect().width);
				};
				var tween = gsap.fromTo(img, { x: 0 }, {
					x: avstand,
					duration: 35,
					ease: 'sine.inOut',
					force3D: true,
					repeat: -1,
					yoyo: true,
					paused: true,
				});
				ScrollTrigger.create({
					trigger: ruta,
					start: 'top bottom',
					end: 'bottom top',
					// Rulla bara när rutan syns.
					onToggle: function (self) {
						if (self.isActive) {
							tween.play();
						} else {
							tween.pause();
						}
					},
					// Ny bredd (ändrad skärmstorlek, bilden laddad): räkna om sträckan.
					onRefresh: function () {
						var p = tween.totalProgress();
						tween.invalidate().totalProgress(p);
					},
				});
				if (!img.complete) {
					img.addEventListener('load', function () {
						ScrollTrigger.refresh();
					}, { once: true });
				}
			});
		});

		// 5. Textfyllnad: orden i .hm-fyll-element börjar ljusgrå och får textens egen färg
		//    i takt med att besökaren scrollar (scrub, ingen tidsstyrning). Stycken som ligger
		//    i samma block fylls som en enda löpande text, från första till sista ordet.
		//    Utan JS eller med minska rörelse visas texten i sin vanliga färg.
		mm.add('(prefers-reduced-motion: no-preference)', function () {
			var fran = '#d3d6db';
			var grupper = [];
			gsap.utils.toArray('.hm-fyll').forEach(function (el) {
				el.setAttribute('data-hjd-farg', window.getComputedStyle(el).color);
				var grupp = grupper.filter(function (g) { return g.foralder === el.parentElement; })[0];
				if (!grupp) {
					grupp = { foralder: el.parentElement, element: [] };
					grupper.push(grupp);
				}
				grupp.element.push(el);
			});
			grupper.forEach(function (grupp) {
				var els = grupp.element;
				SplitText.create(els, {
					type: 'words',
					wordsClass: 'hjd-fyll-ord',
					onSplit: function (self) {
						return gsap.fromTo(self.words, { color: fran }, {
							color: function (i, ord) {
								return ord.closest('.hm-fyll').getAttribute('data-hjd-farg');
							},
							ease: 'none',
							stagger: 0.1,
							scrollTrigger: {
								trigger: els[0],
								endTrigger: els[els.length - 1],
								start: 'top 82%',
								end: 'bottom 48%',
								scrub: 0.6,
							},
						});
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
