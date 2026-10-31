/* Hjuviks Marina – ankarlänkar för one-page.
 * Elementor V4 kan inte sätta id på element, så ankarmålen märks med en global
 * klass: hm-ankare-<namn> blir id="<namn>" (t.ex. hm-ankare-batplatser → #batplatser).
 * Mjuk scroll sköts av CSS (scroll-behavior) och avståndet upptill av klassens scroll-margin-top. */
(function () {
	'use strict';

	var mal = document.querySelectorAll('[class*="hm-ankare-"]');
	Array.prototype.forEach.call(mal, function (el) {
		var m = el.className.match(/(?:^|\s)hm-ankare-([a-z0-9-]+)/);
		if (m && !el.id && !document.getElementById(m[1])) {
			el.id = m[1];
		}
	});

	// Sidan öppnades med #ankare i adressen: id:t fanns inte när webbläsaren försökte scrolla.
	function tillHash() {
		var id = decodeURIComponent((location.hash || '').slice(1));
		var el = id ? document.getElementById(id) : null;
		if (el) {
			el.scrollIntoView({ behavior: 'instant', block: 'start' });
		}
	}
	// Kartan (animerad SVG) spelar sin animation när den laddas. Starta om den när den syns första gången.
	var kartor = document.querySelectorAll('img[src*="hjuviks-karta"]');
	if (kartor.length && 'IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		var obs = new IntersectionObserver(function (poster) {
			poster.forEach(function (p) {
				if (p.isIntersecting) {
					obs.unobserve(p.target);
					var src = p.target.getAttribute('src').replace(/([?&])spela=\d+/, '');
					p.target.removeAttribute('srcset');
					p.target.setAttribute('src', src + (src.indexOf('?') > -1 ? '&' : '?') + 'spela=' + Date.now());
				}
			});
		}, { threshold: 0.35 });
		Array.prototype.forEach.call(kartor, function (img) {
			obs.observe(img);
		});
	}

	// Vänta tills rörelserna (ScrollTrigger) har räknat om sidan vid load, annars hamnar man fel.
	function senare() {
		setTimeout(tillHash, 150);
	}
	if (location.hash) {
		if (document.readyState === 'complete') {
			senare();
		} else {
			window.addEventListener('load', senare);
		}
	}
})();
