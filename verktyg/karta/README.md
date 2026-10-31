# Kartan över Hjuviks Marina

`generera.py` skapar `assets/hjuviks-karta.svg`: en schematisk, animerad karta (vit botten, marinblått #0B2065 och gult #F9E6B3) med Hisingen, Hjuviks udde, Rivöfjorden, Älvsborgsbron och vägen till marinan.

- Kräver Python 3 och fontTools. Etiketterna görs om till vektorformer med typsnittet Inter, så kartan ser likadan ut i alla webbläsare.
- Kustlinjerna är handritade punktlistor som görs naturligare med slumpad mittpunktsförskjutning (fasta frön, så resultatet blir detsamma varje gång).
- Animationen är CSS inuti SVG:n och respekterar "minska rörelse". `assets/ankare.js` startar om den när kartan syns första gången.
- `forhandsvisa.py` renderar bildrutor med Playwright för kontroll.

Kör från repots rot: `python3 verktyg/karta/generera.py`, höj sedan versionen i tillägget och pusha.
