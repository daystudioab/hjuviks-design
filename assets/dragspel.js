/* Hjuviks Marina – mjuka dragspel (e-accordion, <details>).
 * Svaret glider upp och ned (höjd, padding och opacitet, 260 ms, stark ease-out) i stället för att hoppa.
 * Avbryts mitt i och fortsätter från aktuell höjd vid snabba klick. "En öppen åt gången"
 * sköts här i stället för av webbläsarens name-attribut, så att den som stängs också glider.
 * Minska rörelse: ingen animering, bara öppna och stäng. */
(function () {
	'use strict';

	var EASE = 'cubic-bezier(0.23, 1, 0.32, 1)';
	var MS = 260;
	var minska = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

	function innehall(d) {
		var barn = d.children;
		for (var i = 0; i < barn.length; i++) {
			if (barn[i].tagName !== 'SUMMARY') {
				return barn[i];
			}
		}
		return null;
	}

	function rensa(c) {
		c.style.overflow = '';
		c.hjdAnim = null;
	}

	function avbryt(c) {
		if (c.hjdAnim) {
			c.hjdAnim.cancel();
			rensa(c);
		}
	}

	function spela(c, fran, till, klar) {
		c.style.overflow = 'hidden';
		var a = c.animate([fran, till], { duration: MS, easing: EASE });
		c.hjdAnim = a;
		a.onfinish = function () {
			rensa(c);
			if (klar) {
				klar();
			}
		};
	}

	function mat(c) {
		var s = getComputedStyle(c);
		return {
			hojd: c.getBoundingClientRect().height,
			pt: s.paddingTop,
			pb: s.paddingBottom,
			opacitet: s.opacity
		};
	}

	function stang(d) {
		var c = innehall(d);
		if (!c || minska.matches || typeof c.animate !== 'function') {
			d.removeAttribute('data-hjd-stanger');
			d.open = false;
			return;
		}
		var nu = mat(c);
		avbryt(c);
		var full = mat(c);
		d.setAttribute('data-hjd-stanger', '');
		spela(
			c,
			{ height: nu.hojd + 'px', paddingTop: full.pt, paddingBottom: full.pb, opacity: nu.opacitet },
			{ height: '0px', paddingTop: '0px', paddingBottom: '0px', opacity: 0 },
			function () {
				d.open = false;
				d.removeAttribute('data-hjd-stanger');
			}
		);
	}

	function oppna(d) {
		var c = innehall(d);
		var stangdes = d.hasAttribute('data-hjd-stanger');
		var fran = c && c.hjdAnim && stangdes ? mat(c) : null;
		d.removeAttribute('data-hjd-stanger');
		d.open = true;
		if (!c || minska.matches || typeof c.animate !== 'function') {
			return;
		}
		avbryt(c);
		var full = mat(c);
		spela(
			c,
			fran
				? { height: fran.hojd + 'px', paddingTop: full.pt, paddingBottom: full.pb, opacity: fran.opacitet }
				: { height: '0px', paddingTop: '0px', paddingBottom: '0px', opacity: 0 },
			{ height: full.hojd + 'px', paddingTop: full.pt, paddingBottom: full.pb, opacity: 1 }
		);
	}

	function arOppen(d) {
		return d.open && !d.hasAttribute('data-hjd-stanger');
	}

	function starta(lista) {
		if (lista.hasAttribute('data-hjd-dragspel')) {
			return;
		}
		lista.setAttribute('data-hjd-dragspel', '');
		var poster = [].slice.call(lista.querySelectorAll(':scope > details'));
		poster.forEach(function (d) {
			// Webbläsarens grupp (name) stänger de andra direkt; vi stänger dem själva, med rörelse.
			var grupp = d.getAttribute('name');
			if (grupp) {
				d.setAttribute('data-hjd-grupp', grupp);
				d.removeAttribute('name');
			}
			var rubrik = d.querySelector(':scope > summary');
			if (!rubrik) {
				return;
			}
			rubrik.addEventListener('click', function (e) {
				e.preventDefault();
				if (arOppen(d)) {
					stang(d);
					return;
				}
				var g = d.getAttribute('data-hjd-grupp');
				if (g) {
					poster.forEach(function (annan) {
						if (annan !== d && annan.getAttribute('data-hjd-grupp') === g && arOppen(annan)) {
							stang(annan);
						}
					});
				}
				oppna(d);
			});
		});
	}

	function allt(rot) {
		[].forEach.call((rot || document).querySelectorAll('.e-accordion-base'), starta);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', function () {
			allt();
		});
	} else {
		allt();
	}
})();
