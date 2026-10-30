# Hjuviks Marina – Design och rörelse

WordPress-tillägg för hjuviksmarina.se. Byggt av Studio Day.

## Ny version

1. Höj `Version:` i `hjuviks-design.php` (och versionskonstanten under).
2. Committa och pusha till `main`. Commit-meddelandet blir releasens anteckningar.
3. GitHub Actions ser att versionen är ny, bygger `hjuviks-design.zip` och publicerar releasen `v` + versionsnumret.
   Ändringar utan ny version ger ingen release.
4. Sajten visar uppdateringen under **Tillägg** (kollar var 12:e timme, eller direkt via länken *Sök efter uppdateringar* på tilläggets rad).

## Publikt repo

Repot är publikt, så sajten hämtar releaser utan nyckel. Om repot görs privat behöver `wp-config.php` en läsnyckel
(fine-grained token med **Contents: Read-only**): `define( 'STUDIODAY_GITHUB_TOKEN', 'github_pat_…' );`

## Innehåll

- `lib/plugin-update-checker/` – [Plugin Update Checker](https://github.com/YahnisElsts/plugin-update-checker) v5.6 (MIT), sköter uppdateringarna.
