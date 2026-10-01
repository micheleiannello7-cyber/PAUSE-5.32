# PAUSE — PRD (Product Requirements Document)

## Original Problem Statement
L'utente ha chiesto di estrarre la sua app dal repository GitHub `https://github.com/micheleiannello7-cyber/PAUSE-5.31.git` e fornire una preview pronta e completa.

## App Overview
PAUSE è un'app mobile (Expo/React Native + FastAPI + MongoDB) di micro-apprendimento in italiano/inglese: curiosità ("storie") e mini-lezioni organizzate in 12 categorie (Scienza, Spazio, Tecnologia, Natura, Animali, Storia, Psicologia, Corpo Umano, Cultura, Economia, Arte & Design, Geografia & Viaggi).

## Architecture
- **Frontend**: Expo Router (SDK 57), React Native 0.86, react-query, reanimated. Schermate: onboarding, discover/explore (tabs), bookmarks, profile, deep-dive storia, playlist, stats, history, premium, unlock.
- **Backend**: FastAPI (`/api/*`), MongoDB con seed idempotente all'avvio. Contenuti caricati da `seed_data.py`, `seed_pack_*`, `seed_lessons_*`, `v8_content.json`, `v9_content.json`.
- **Object Storage**: Emergent Managed Object Storage per copertine/illustrazioni (usa `EMERGENT_LLM_KEY`).

## Current State (extraction — 2026-09-30)
- App estratta dal repo in `/app`, preservando `.env` di preview (URL/Mongo).
- Dipendenze installate: pip (backend) + yarn (frontend). Nessun errore.
- Backend avviato: `/api/health` = ok (db: true). Seed automatico: **12 categorie, 493 storie**.
- `EMERGENT_LLM_KEY` aggiunto a `backend/.env` per il sync delle copertine su object storage.
- Preview verificata: onboarding + selezione categorie con illustrazioni 3D funzionanti end-to-end.

## Integrations Status (per scelta utente — 2026-09-30)
- Narrazione audio TTS: **DISATTIVATA** (`TTS_ENABLED="false"`).
- Generazione immagini AI copertine: **non necessaria** (immagini già presenti su object storage).
- Pagamenti/abbonamenti Stripe: **DISATTIVATI**.

## Core Requirements (static)
- Contenuti multilingua (it/en) con categorie, storie a capitoli, mini-lezioni.
- Onboarding personalizzato, bookmark, cronologia, statistiche, profilo con preferenze (tema/accent/lingua).

## Backlog / Remaining (P1/P2)
- P1: Attivazione opzionale TTS (OpenAI o ElevenLabs) su richiesta con chiave utente.
- P1: Attivazione opzionale Stripe per premium/abbonamenti su richiesta con chiave utente.
- P2: Generazione nuove copertine/contenuti via pipeline esistente (richiede credito Universal Key).

## Tipografia (2026-10-01)
- Unico font: **Plus Jakarta Sans** (TTF in `frontend/assets/fonts`, 5 pesi) via `src/utils/fonts.ts` + `theme.ts/typography`
  (displayHero=ExtraBold titoli schermata, displayBold=Bold sezioni/capitoli, display=SemiBold, body=Regular, bodyMedium, bodyBold=SemiBold).

## Lettore: un capitolo = una schermata (2026-10-01)
- `reader-section.tsx`: compatto → riduzione automatica del corpo (min 85% di 16,5pt) → se il testo sta ma collide con l'anticipazione,
  l'anticipazione viene nascosta (`ChapterTrack.teaserHidden`) → solo altrimenti 2 pagine.
- Backend: `fit_chapters.py` (GPT-5.4) snellisce i capitoli > 500 caratteri (IT+EN); salva in `chapter_fit_overrides.json`,
  riapplicato da `ensure_seed` (`chapter_fit.apply_fit_overrides`). Backup in `stories_backup_pre_fit`.

## Home (2026-10-01)
- Rimosso l'indicatore di avanzamento del mazzo (deck-progress.tsx eliminato); la card si allunga dello spazio liberato.

## Next Tasks
- `fit_chapters.py` eseguito parzialmente (2026-10-01): 281/726 capitoli snelliti (104 storie) con ~1 $ di credito; la chiave si è esaurita.
  Restano 445 capitoli in 105 narrazioni (~1,2 $). Rilanciare `python fit_chapters.py` (idempotente) dopo la ricarica.
