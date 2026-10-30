# Hjuviks Marina – Design och rörelse

WordPress-tillägg för hjuviksmarina.se. Byggt av Studio Day.

## Ny version

1. Höj `Version:` i `hjuviks-design.php` (och versionskonstanten under).
2. Committa och tagga med samma nummer, t.ex. `git tag -a v1.2.3 -m "Vad som ändrats"`, och pusha taggen.
3. GitHub Actions bygger `hjuviks-design.zip` och publicerar en release.
4. Sajten visar uppdateringen under **Tillägg** (kollar var 12:e timme, eller direkt via länken *Sök efter uppdateringar* på tilläggets rad).

## Publikt repo

Repot är publikt, så sajten hämtar releaser utan nyckel. Om repot görs privat behöver `wp-config.php` en läsnyckel
(fine-grained token med **Contents: Read-only**): `define( 'STUDIODAY_GITHUB_TOKEN', 'github_pat_…' );`

## Innehåll

- `lib/plugin-update-checker/` – [Plugin Update Checker](https://github.com/YahnisElsts/plugin-update-checker) v5.6 (MIT), sköter uppdateringarna.
