
# GCP Upload (Cloud Run + Cloud Build + Artifact Registry) — EcoGuard (FE/BE)

Dokumen ini merangkum langkah deploy yang kita lakukan: bikin Artifact Registry, build otomatis dari GitHub pakai Cloud Build Trigger, lalu deploy ke Cloud Run. Termasuk setting supaya hemat biaya dan tidak cepat lewat limit.

## 0) Konsep singkat (biar nggak bingung)

- **Artifact Registry**: tempat nyimpan Docker image (hasil build).
- **Cloud Build**: yang build Docker image (otomatis via trigger saat push ke GitHub, atau manual Run trigger).
- **Cloud Run**: yang menjalankan container jadi URL website/API.

Repo kamu adalah **monorepo**:

- `frontend/` (Angular SSR) → Cloud Run service `ecoguard-fe`
- `backend/` (NestJS) → Cloud Run service `ecoguard-be`

## 1) Biar hemat biaya (anti “kaget tagihan”)

### Cloud Run

- Billing: **Request-based**
- Minimum instances: **0**
- (Opsional) Maximum instances: **1–2** dulu saat testing

Dengan min instances 0, saat tidak ada request, instance bisa scale ke 0.

### Budget alert (wajib buat tenang)

Budget alert hanya notifikasi, bukan auto stop.

- Billing → Budgets & alerts → buat budget kecil (mis. $1–$3)
- Alert di 50/90/100% sudah cukup untuk testing

### Image & build

- **Artifact Registry**: storage image bisa nambah biaya kalau image banyak → hapus image lama kalau sudah numpuk.
- **Cloud Build**: build terlalu sering bisa nambah biaya → jangan push kecil-kecil terlalu sering saat testing.

## 2) Artifact Registry (buat FE/BE)

Artifact Registry → Repositories → Create repository:

- Format: **Docker**
- Mode: **Standard**
- Location type: **Region**
- Region: `asia-southeast2 (Jakarta)` (samakan dengan Cloud Run)

Rekomendasi nama repo:

- FE: `ecoguard-fe`
- BE: `ecoguard-be`

## 3) Cloud Build Trigger (otomatis build dari GitHub)

### 3.1 Trigger FE (Angular SSR)

Cloud Build → Triggers → Create trigger:

- Name: `ecoguard-fe-build`
- Event: Push to a branch
- Branch: `main` (atau regex `^main$`)
- Repository: `reven-erlangga/ecoguard`
- Configuration:
  - Type: **Cloud Build configuration file**
  - Path: `frontend/cloudbuild.frontend.yaml`
- Substitution variables saat Run trigger:
  - `_REGION` = `asia-southeast2`
  - `_AR_REPO` = `ecoguard-fe`
  - `_IMAGE_NAME` = `ecoguard-fe`
  - `_BACKEND_URL` = `https://example.com` (sementara) atau URL backend nanti

Catatan: untuk project ini, `BACKEND_URL` lebih aman diisi saat build (build-time) dan juga diset di runtime Cloud Run.

### 3.2 Trigger BE (NestJS)

Cloud Build → Triggers → Create trigger:

- Name: `ecoguard-be-build`
- Event: Push to a branch
- Branch: `main` (atau regex `^main$`)
- Repository: `reven-erlangga/ecoguard`
- Configuration:
  - Type: **Cloud Build configuration file**
  - Path: `backend/cloudbuild.backend.yaml`
- Substitution variables:
  - `_REGION` = `asia-southeast2`
  - `_AR_REPO` = `ecoguard-be`
  - `_IMAGE_NAME` = `ecoguard-be`

### 3.3 Service Account (org policy)

Kalau project kamu mewajibkan **user-managed service account** untuk trigger:

- Buat service account terpisah (lebih aman):
  - `cloud-build-ecoguard-fe`
  - `cloud-build-ecoguard-be`
- Role minimal untuk build + push image:
  - Cloud Build Editor
  - Artifact Registry Writer

Kalau kamu dapat error terkait logging bucket saat pakai service account, pastikan config Cloud Build punya:

- `options.logging: CLOUD_LOGGING_ONLY`

(Ini sudah diterapkan di `frontend/cloudbuild.frontend.yaml` yang kita pakai.)

## 4) Jalankan build (biar image muncul)

Cloud Build → Triggers → klik **Run** pada trigger FE/BE.

Setelah SUCCESS:

- Artifact Registry → repo (mis. `ecoguard-fe`) → image akan muncul dengan tag seperti `SHORT_SHA`.

## 5) Deploy ke Cloud Run (dari UI)

Cloud Run → Create service:

### 5.1 Deploy FE

- Service name: `ecoguard-fe`
- Region: `asia-southeast2`
- Deploy from: Container image → pilih image dari Artifact Registry:
  - `ecoguard-fe:<SHORT_SHA>` (tag paling baru)
- Authentication: Allow unauthenticated (kalau web public)
- Billing: Request-based
- Min instances: 0
- Env (Variables & Secrets):
  - `BACKEND_URL = https://example.com` (sementara)

Selesai deploy, Cloud Run akan memberikan **URL** untuk FE.

### 5.2 Deploy BE

- Service name: `ecoguard-be`
- Region: `asia-southeast2`
- Deploy from: Container image → pilih image:
  - `ecoguard-be:<SHORT_SHA>`
- Authentication:
  - Allow unauthenticated (kalau API public yang dipakai FE)
- Billing: Request-based
- Min instances: 0
- Env (Variables & Secrets): isi dari `backend/.env.example`
  - `X_BEARER_TOKEN`
  - `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`
  - `GEMINI_API_KEY`
  - `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
  - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
  - (kalau dipakai) `JWT_SECRET`, `X_USERNAME`, `TWITTERAPI_KEY`, `TWITTERAPI_UNAME`, `DBSCAN_EPSILON`, `DBSCAN_MIN_PTS`

Selesai deploy, Cloud Run akan memberikan **URL** untuk BE.

## 6) Hubungkan FE → BE (setelah BE punya URL)

Setelah backend sudah punya URL Cloud Run:

1) Update trigger FE variable `_BACKEND_URL` = URL BE (mis. `https://ecoguard-be-xxxxx.asia-southeast2.run.app`)
2) Run trigger FE lagi (build image FE baru)
3) Deploy revision FE pakai image terbaru
4) Pastikan backend CORS mengizinkan origin dari URL FE (di backend kamu sudah `origin: true`, jadi harusnya aman untuk testing)

## 7) Cara stop supaya aman (kalau cuma testing)

- Cloud Run: delete service `ecoguard-fe` / `ecoguard-be` kalau sudah selesai testing.
- Cloud Build: disable trigger biar tidak build otomatis.
- Artifact Registry: hapus image lama kalau sudah banyak.
