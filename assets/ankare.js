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
