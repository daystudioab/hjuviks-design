/* Hjuviks Marina – rörelser (GSAP).
 * Tre motiverade moment:
 * 1. Heron: sveps upp från mitten och ut när havsytan är redo, sedan tonas text och logga in.
 * 2. Citatet: orden får full färg i läsfart medan man scrollar.
 * 3. Bilder: öppnar sig när de kommer in i bild.
 * 4. Panorering i .hm-panorera-rutor.
 * 5. Textfyllnad: text med klassen hm-fyll är ljusgrå och fylls i ord för ord i scrollfart,
 *    stycken i samma block som en enda löpande text.
 * 6. Paus: block med klassen hm-paus tonas in i scrollfart och stannar sedan en kort stund i
 *    fönstrets mitt medan sidan scrollar.
 * 7. Zoom: block med klassen hm-zoom börjar något större och zoomas på plats i scrollfart.
 * Allt stängs av vid "minska rörelse". */
(function () {
	'use strict';

	if (!window.gsap || !window.ScrollTrigger || !window.SplitText) {
		return;
	}

	gsap.registerPlugin(ScrollTrigger, SplitText);

	// Mobilens adressfält ändrar fönsterhöjden när man scrollar. Räkna inte om allt då,
	// det ger ryck i fästet och zoomen.
	ScrollTrigger.config({ ignoreMobileResize: true });

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
			// 1. Hero: vänta tills havsytan har ritat sin första bild (eller högst 1,5 s), svep
			//    sedan upp heron från mitten och ut med clip-path, och tona därefter in allt
			//    innehåll (logga, rubrik, ingress, knappar). CSS håller heron stängd tills dess.
			if (hero) {
				var innehall = Array.prototype.filter.call(hero.children, function (el) {
					return !el.classList.contains('hjd-hav');
				});
				var radie = window.getComputedStyle(hero).borderTopLeftRadius || '0px';
				var stangd = 'inset(0% 50% 0% 50% round ' + radie + ')';
				var oppen = 'inset(0% 0% 0% 0% round ' + radie + ')';

				// Elementors behållare har en CSS-övergång som annars släpar efter GSAP.
				innehall.forEach(function (el) {
					el.style.transition = 'none';
				});
				gsap.set(hero, { clipPath: stangd });
				gsap.set(innehall, { autoAlpha: 0 });
				hero.classList.add('hjd-intro-start');

				var intro = gsap.timeline({ paused: true });
				// fromTo med båda värdena utskrivna: webbläsaren förkortar annars startvärdet
				// (inset(0% 50%)) och GSAP parar då ihop fel siffror, så svepet går från vänster.
				intro
					.fromTo(hero, { clipPath: stangd }, { clipPath: oppen, duration: 1.4, ease: 'expo.inOut', immediateRender: false })
					.set(hero, { clearProps: 'clipPath' })
					.to(innehall, {
						autoAlpha: 1,
						duration: 1,
						ease: 'power2.out',
						stagger: 0.08,
						clearProps: 'opacity,visibility,transition',
					}, '>-0.1');

				var startat = false;
				var starta = function () {
					if (startat) {
						return;
					}
					startat = true;
					intro.play();
				};
				if (hero.hasAttribute('data-hav-redo')) {
					starta();
				} else {
					hero.addEventListener('hjd:hav-redo', starta, { once: true });
					setTimeout(starta, 1500);
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
				return !img.closest('.hm-panorera, .hm-zoom');
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

		// 6. Paus: ett .hm-paus-block fäster i fönstrets mitt en kort stund (45 % av fönstrets
		//    höjd i scrollsträcka) medan sidan runt omkring fortsätter. Fästet räknas om först
		//    (refreshPriority), så att utlösare längre ned tar hänsyn till det extra utrymmet.
		// 7. Zoom: ett .hm-zoom-block börjar något större (högst 20 %, aldrig bredare än
		//    fönstret) och zoomas ned till sin plats i takt med scrollen.
		//    Elementors behållare har en övergång på transform som skulle släpa efter scrollen,
		//    så den stängs av. Utan JS eller med minska rörelse står allt bara på plats.
		mm.add('(prefers-reduced-motion: no-preference)', function () {
			gsap.utils.toArray('.hm-paus').forEach(function (el) {
				el.style.transition = 'none';
				// Innehållet tonas in (och glider upp en aning) när det kommer in nedifrån och är
				// helt tydligt när tre rader syns i fönstret. Barnen animeras, inte själva blocket,
				// så att fästet mäter blocket orört.
				var barn = Array.prototype.slice.call(el.children);
				barn.forEach(function (b) {
					b.style.transition = 'none';
				});
				var treRader = function () {
					var text = el.querySelector('p') || el;
					var rad = parseFloat(window.getComputedStyle(text).lineHeight) || 40;
					return Math.round(rad * 3);
				};
				gsap.fromTo(barn, { autoAlpha: 0, y: 16 }, {
					autoAlpha: 1,
					y: 0,
					ease: 'none',
					force3D: true,
					scrollTrigger: {
						trigger: el,
						start: 'top bottom',
						end: function () {
							return 'top bottom-=' + treRader();
						},
						scrub: 0.25,
						invalidateOnRefresh: true,
					},
				});
				ScrollTrigger.create({
					trigger: el,
					start: 'center center',
					end: function () {
						return '+=' + Math.round(window.innerHeight * 0.45);
					},
					pin: true,
					pinSpacing: true,
					// Ingen anticipatePin: med vanlig scroll fäster den blocket en bildruta för
					// tidigt, vilket syns som ett ryck på 10–15 px när pausen börjar.
					refreshPriority: 1,
					invalidateOnRefresh: true,
				});
			});

			gsap.utils.toArray('.hm-zoom').forEach(function (el) {
				el.style.transition = 'none';
				var startskala = function () {
					var bredd = el.offsetWidth || 1;
					var ledigt = window.innerWidth / bredd;
					return Math.max(1, Math.min(1.2, ledigt));
				};
				gsap.fromTo(el, {
					scale: startskala,
					transformOrigin: '50% 50%',
				}, {
					scale: 1,
					ease: 'power2.out',
					force3D: true,
					scrollTrigger: {
						trigger: el,
						start: 'top bottom',
						end: 'center 55%',
						scrub: 1,
						invalidateOnRefresh: true,
					},
				});
			});
		});

		mm.add('(prefers-reduced-motion: reduce)', function () {
			if (hero) {
				hero.classList.add('hjd-intro-start');
			}
		});

		window.addEventListener('load', function () {
			ScrollTrigger.refresh();
		});

		// Bilder som laddas sent (lazy loading) ändrar höjder efter load. Räkna om
		// utlösarna en gång när de har laddats klart, annars hoppar fästet och zoomen.
		var vantar = null;
		var omrakna = function () {
			clearTimeout(vantar);
			vantar = setTimeout(function () {
				ScrollTrigger.refresh();
			}, 150);
		};
		Array.prototype.forEach.call(document.querySelectorAll('.elementor img'), function (img) {
			if (!img.complete) {
				img.addEventListener('load', omrakna, { once: true });
			}
		});
	}

	if (document.fonts && document.fonts.ready) {
		document.fonts.ready.then(start);
	} else {
		start();
	}
})();
