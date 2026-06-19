# Planset QC Interactive Demo

A front-end demo of an **AI document-QC platform** that audits multi-page solar PV
engineering plansets. It reads each drawing with a multimodal LLM, extracts values,
and runs hundreds of automated compliance checks (NEC code, cross-sheet consistency,
arithmetic validation), then presents the findings as a reviewable pass / fail /
needs-review report grouped by sheet category.

> **This repository is a sanitized UI demo.** It ships with **fictional sample data**
> only, with no real client, company, or planset information, and no proprietary rule
> content. The findings reference public NEC / IEEE code concepts purely to make the
> interface realistic. The production system (FastAPI + an AI/rules pipeline, deployed
> on Azure Container Apps) is not included here.

## Live demo

➡️ **https://jayasurya23.github.io/planset-qc-demo/**

Click projects in the sidebar, switch between rerun versions, filter by status
(Pass / Fail / Needs Review / Deferred), drill into a sheet category, and open a
finding for its evidence.

## What it demonstrates

- **Project + version history:** runs grouped by project and design stage (30 % / 60 % / 90 %), with non-destructive rerun versioning.
- **Findings dashboard:** score cards, per-category coverage, severity, confidence, and supporting evidence for every check.
- **Snippet clipping + bounding boxes:** each located finding shows a cropped "snippet" of its drawing region on the card, and opens to the full sheet with the finding's **bounding box** highlighted. (In this demo the sheets are *synthetic vector mock drawings* (no real planset imagery), so the clip/overlay feature can be shown without exposing confidential client drawings.)
- **Multi-engine review model:** findings produced by AI vision, a rules engine, arithmetic validators, and cross-sheet consistency checks.

## Tech

React + TypeScript + Vite. Deployed to GitHub Pages via GitHub Actions
(`.github/workflows/deploy.yml`).

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static build into dist/
```
