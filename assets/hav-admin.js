/* Utseende → Havsyta: färgväljare med levande förhandsvisning. */
const $ = window.jQuery;
const cfg = window.HJD_HAV_ADMIN || {};
const falt = Array.from(document.querySelectorAll('.hjd-hav-farg'));
const scen = document.getElementById('hjd-hav-scen');

let hav = null;

function nuvarande() {
	const ut = {};
	falt.forEach((el) => {
		ut[el.dataset.nyckel] = el.value;
	});
	return ut;
}

function reservToning() {
	const f = nuvarande();
	scen.style.backgroundColor = f.djup;
	scen.style.backgroundImage = `linear-gradient(180deg, ${f.spridning} 0%, ${f.djup} 100%)`;
}

function uppdatera() {
	reservToning();
	if (hav) {
		hav.setFarger(nuvarande());
	}
}

// Färgväljarna (WordPress Iris). Uppdatera förhandsvisningen medan man drar.
falt.forEach((el) => {
	$(el).wpColorPicker({
		change: (event, ui) => {
			el.value = ui.color.toString();
			uppdatera();
		},
		clear: () => setTimeout(uppdatera, 0),
	});
});

function sattFarger(farger) {
	falt.forEach((el) => {
		const v = farger[el.dataset.nyckel];
		if (v) {
			$(el).wpColorPicker('color', v);
			el.value = v;
		}
	});
	uppdatera();
}

document.querySelectorAll('.hjd-hav-forval-knapp').forEach((knapp) => {
	knapp.addEventListener('click', () => {
		const skala = (cfg.forval || {})[knapp.dataset.forval];
		if (!skala) {
			return;
		}
		const nycklar = ['djup', 'spridning', 'zenit', 'horisont', 'sol'];
		const farger = {};
		nycklar.forEach((k, i) => {
			farger[k] = skala[i];
		});
		sattFarger(farger);
	});
});

const aterstall = document.querySelector('.hjd-hav-aterstall');
if (aterstall) {
	aterstall.addEventListener('click', () => sattFarger(cfg.standard || {}));
}

reservToning();

// Samma havsyta som på startsidan.
import(`./hav.js?ver=${encodeURIComponent(cfg.version || '')}`)
	.then(({ skapaHav }) => {
		hav = skapaHav(scen, { farger: nuvarande(), rubrik: 'h2', fordrojning: 0 });
	})
	.catch(() => {
		/* Utan WebGL visas bara toningen. */
	});
