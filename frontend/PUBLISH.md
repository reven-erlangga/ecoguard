
# Publish Frontend (Angular SSR) ke Google Cloud (GCP)

Project ini adalah Angular SSR (output `dist/frontend/browser` + `dist/frontend/server`) dan dijalankan oleh Node/Express lewat `dist/frontend/server/server.mjs`.

Environment variable yang dipakai:

- `BACKEND_URL` → dipakai oleh frontend untuk base URL API (lihat [api.service.ts](file:///Volumes/Drive/Personal/Project/Vibe%20Coding%20-%20Google%20Event/frontend/src/app/shared/services/api.service.ts#L1-L38))
- `PORT` → port server SSR (Cloud Run akan otomatis set `PORT`)

## Pilih cara deploy

- **Cara A: Dengan gcloud CLI** (jalankan command lewat Terminal lokal atau Cloud Shell)
- **Cara B: Tanpa gcloud CLI** (pakai UI Console + Cloud Build/Cloud Run)

Di dua cara ini, best practice untuk `.env` tetap sama: **jangan upload file `.env`**, gunakan **Cloud Run env vars** / **Secret Manager**.

## Dockerfile (wajib untuk deploy Cloud Run)

Folder `frontend/` sudah punya `Dockerfile`. Cloud Run menjalankan aplikasi sebagai container, jadi Dockerfile ini dipakai oleh Docker/Cloud Build untuk menghasilkan image yang berisi:

- hasil build Angular SSR (`dist/frontend/browser` + `dist/frontend/server`)
- runtime Node untuk menjalankan `dist/frontend/server/server.mjs`

## A) Dengan gcloud CLI

### A0) Prasyarat

- Sudah punya **GCP Project** + **Billing aktif**
- Install **gcloud CLI** (kalau pakai Cloud Shell, sudah tersedia)
- Install Docker (opsional kalau build image-nya pakai Cloud Build, bukan local)

Kalau pakai Cloud Shell:

- Buka Cloud Shell di GCP Console
- Clone repo frontend kamu, lalu masuk ke folder `frontend/`

Login & set project:

```bash
gcloud auth login
gcloud config set project <PROJECT_ID>
```

Enable API yang dibutuhkan:

```bash
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com
```

### A1) Siapkan `.env` untuk local (jangan di-commit)

Di root frontend, buat file `.env`:

```env
BACKEND_URL=http://localhost:3001
```

Catatan:

- `.env` untuk local dev/build. Jangan upload `.env` ke repo.
- Di GCP, pakai **Cloud Run env vars** atau **Secret Manager**.

Checklist sebelum push ke GitHub:

- Pastikan `.env` tidak ikut ke Git (sudah di-ignore oleh `.gitignore`)
- Pastikan tidak ada file credential/key (service account, private key, dll) di-commit

### A2) Test build & run SSR di lokal (opsional tapi direkomendasikan)

```bash
npm ci
npm run build
PORT=4000 node dist/frontend/server/server.mjs
```

Kalau mau test pakai Docker lokal:

```bash
docker build --build-arg BACKEND_URL="http://localhost:3001" -t google-event-frontend .
docker run --rm -p 8080:8080 -e BACKEND_URL="http://localhost:3001" google-event-frontend
```

Buka:

- http://localhost:4000 (tanpa Docker)
- http://localhost:8080 (pakai Docker)

### A3) Buat Artifact Registry

Set variabel yang dipakai:

```bash
PROJECT_ID="<PROJECT_ID>"
REGION="asia-southeast2"
REPO="frontend-repo"
SERVICE="google-event-frontend"
```

Biar rapi, siapkan juga:

```bash
BACKEND_URL="https://<DOMAIN_BACKEND_PROD>"
TAG="v1"
IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/$SERVICE:$TAG"
```

Buat repo Docker:

```bash
gcloud artifacts repositories create "$REPO" \
  --repository-format=docker \
  --location="$REGION"
```

Auth Docker ke Artifact Registry (hanya diperlukan kalau kamu push dari laptop):

```bash
gcloud auth configure-docker "$REGION-docker.pkg.dev"
```

### A4) Build & push image

#### A4a) Build pakai Docker lokal

```bash
docker build \
  --build-arg BACKEND_URL="$BACKEND_URL" \
  -t "$IMAGE" \
  .

docker push "$IMAGE"
```

#### A4b) Build tanpa Docker lokal (pakai Cloud Build)

```bash
gcloud builds submit \
  --config=- \
  --substitutions=_BACKEND_URL="$BACKEND_URL",_IMAGE="$IMAGE" \
  . <<'YAML'
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - build
      - '--build-arg'
      - 'BACKEND_URL=${_BACKEND_URL}'
      - '-t'
      - '${_IMAGE}'
      - '.'
images:
  - '${_IMAGE}'
YAML
```

### A5) Deploy ke Cloud Run

```bash
gcloud run deploy "$SERVICE" \
  --image "$IMAGE" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "BACKEND_URL=$BACKEND_URL"
```

Setelah deploy berhasil, kamu akan dapat URL service Cloud Run. Gunakan URL itu untuk:

- test akses web
- set CORS di backend (lihat bagian CORS)

## B) Tanpa gcloud CLI (Full Console UI)

Ini artinya: kamu **tidak install gcloud** dan **tidak menjalankan command gcloud**. Semua dilakukan via browser (GCP Console).

### B0) Prasyarat

- Sudah punya **GCP Project** + **Billing aktif**
- Repo ada di GitHub (opsional tapi sangat membantu untuk Cloud Build)

### B1) Enable API (via Console)

Di GCP Console → **APIs & Services** → **Library**, enable:

- Cloud Run API
- Artifact Registry API
- Cloud Build API

### B2) Buat Artifact Registry (via Console)

Console → **Artifact Registry** → **Repositories** → **Create Repository**

- Format: Docker
- Location type: Region
- Region: mis. `asia-southeast2`
- Name: `frontend-repo`

### B3) Build image pakai Cloud Build (via Console)

Opsi yang paling enak: pakai **Cloud Build Trigger** (build otomatis dari GitHub).

Console → **Cloud Build** → **Triggers** → **Create trigger**

- Source: GitHub → pilih repo `reven-erlangga/ecoguard` + branch (mis. `main`)
- Configuration: pakai salah satu:
  - **(Disarankan)** `Cloud Build configuration file` (supaya bisa set build arg `BACKEND_URL`)
  - `Dockerfile` (kalau UI kamu tidak butuh build arg, tapi ini kurang cocok untuk project ini)

Set `BACKEND_URL`:

- Project ini menggunakan `process.env['BACKEND_URL']`, jadi **disarankan** set `BACKEND_URL` saat build (build-time) dan juga saat runtime Cloud Run.

#### B3a) Disarankan: Trigger pakai file `frontend/cloudbuild.frontend.yaml`

Di repo ini sudah ada file build config: `frontend/cloudbuild.frontend.yaml`.

Saat create trigger:

- Configuration: `Cloud Build configuration file`
- Location: `Repository`
- Cloud Build configuration file location: `frontend/cloudbuild.frontend.yaml`

Lalu isi **Substitution variables** (biasanya ada di bagian Advanced / Substitutions):

- `_REGION` = `asia-southeast2`
- `_AR_REPO` = `ecoguard-fe` (nama repository Artifact Registry kamu)
- `_IMAGE_NAME` = `ecoguard-fe` (nama image; bebas, tapi disarankan sama dengan service)
- `_BACKEND_URL` = `https://<DOMAIN_BACKEND_PROD>`

Setelah trigger dibuat, klik **Run** untuk build. Hasilnya akan push image ke:

- `${_REGION}-docker.pkg.dev/<PROJECT_ID>/${_AR_REPO}/${_IMAGE_NAME}:<SHORT_SHA>`

#### B3b) Alternatif: Trigger pakai `Dockerfile` (kurang disarankan untuk project ini)

Kalau kamu tetap mau pakai `Dockerfile` config:

- Configuration: `Dockerfile`
- Dockerfile path/directory: pilih folder `frontend` (karena Dockerfile ada di `frontend/Dockerfile`)
- Build context: `frontend`
- Image (Artifact Registry): pilih repo `ecoguard-fe`, image name `ecoguard-fe`, tag (mis. `v1`)

Catatan: UI Dockerfile trigger sering tidak menyediakan cara untuk set `--build-arg BACKEND_URL`, jadi setelah deploy bisa saja browser masih mengarah ke backend default. Kalau terjadi, pakai B3a atau Cara A (Cloud Shell) yang bisa inject build arg.

### B4) Deploy ke Cloud Run (via Console)

Console → **Cloud Run** → **Create service**

- Deploy from: **Container image**
- Pilih image dari Artifact Registry hasil Cloud Build
- Region: sama dengan Artifact Registry (mis. `asia-southeast2`)
- Authentication: Allow unauthenticated (kalau public)

### B5) Set environment variable (via Console)

Console → Cloud Run service → **Edit & Deploy New Revision** → **Variables & Secrets**

- Tambah env var:
  - `BACKEND_URL` = `https://<DOMAIN_BACKEND_PROD>`

Deploy.

## CORS (backend)

Karena frontend akan di-serve dari domain Cloud Run, backend harus mengizinkan origin tersebut (mis. `https://<service>-xxxxx-<region>.run.app` atau custom domain kamu).

Minimal pastikan:

- Allow origin dari domain Cloud Run / custom domain
- Allow headers `Authorization` (karena ada auth interceptor)

## Update tanpa downtime (versi baru)

- Cara A: build image tag baru → deploy Cloud Run pakai `gcloud run deploy`
- Cara B: jalankan trigger Cloud Build (image baru) → Cloud Run deploy revision baru (UI)

Cloud Run akan rolling update otomatis.

## Catatan tentang `.env` di production

Untuk production, jangan upload file `.env`. Gunakan salah satu:

- **Cloud Run env vars** untuk value non-secret seperti `BACKEND_URL`
- **Secret Manager** untuk value sensitif (API keys, client secrets), lalu expose sebagai env var di Cloud Run

Kalau suatu saat perlu ganti `BACKEND_URL` tanpa rebuild image:

- Saat ini nilai `BACKEND_URL` dipakai juga di browser bundle (build-time). Jadi perubahan runtime env saja belum tentu mengubah request dari browser.
- Solusi jangka panjang biasanya: pakai relative `/api` + proxy di SSR server, atau runtime config endpoint (`/assets/config.json`) yang dibaca saat app start.

---

# Backend (NestJS) ke Cloud Run (Monorepo: folder `backend/`)

Bagian ini untuk deploy backend NestJS yang ada di folder `backend/` pada repo yang sama.

## 1) Siapkan file untuk backend

Buat 2 file berikut di repo kamu (di folder `backend/`):

### A) `backend/Dockerfile`

```Dockerfile
FROM node:20-alpine AS build
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=build /app/dist ./dist
COPY --from=build /app/assets ./assets

EXPOSE 8080
CMD ["node", "dist/main"]
```

Catatan:

- Backend ini baca file dataset dari folder `assets/` (CSV/txt) pakai `process.cwd()`, jadi folder `assets` harus ikut tercopy ke container.
- Server listen di `process.env.PORT` (Cloud Run isi otomatis). Di Dockerfile diset default `8080`.

### B) `backend/cloudbuild.backend.yaml`

```yaml
steps:
  - name: gcr.io/cloud-builders/docker
    args:
      - build
      - -f
      - backend/Dockerfile
      - -t
      - ${_REGION}-docker.pkg.dev/$PROJECT_ID/${_AR_REPO}/${_IMAGE_NAME}:$SHORT_SHA
      - backend

images:
  - ${_REGION}-docker.pkg.dev/$PROJECT_ID/${_AR_REPO}/${_IMAGE_NAME}:$SHORT_SHA

options:
  logging: CLOUD_LOGGING_ONLY

substitutions:
  _REGION: asia-southeast2
  _AR_REPO: ecoguard-be
  _IMAGE_NAME: ecoguard-be
```

## 2) Buat Artifact Registry untuk backend

Di Artifact Registry → Create Repository:

- Name: `ecoguard-be`
- Format: Docker
- Mode: Standard
- Region: `asia-southeast2`

## 3) Buat Cloud Build Trigger (backend)

Cloud Build → Triggers → Create trigger:

- Name: `ecoguard-be-build`
- Event: Push to a branch
- Branch regex: `^main$`
- Configuration:
  - Type: Cloud Build configuration file
  - Location: Repository
  - Path: `backend/cloudbuild.backend.yaml`
- Substitution variables:
  - `_REGION` = `asia-southeast2`
  - `_AR_REPO` = `ecoguard-be`
  - `_IMAGE_NAME` = `ecoguard-be`

Kalau org policy kamu mewajibkan user-managed service account:

- Buat service account mis. `cloud-build-ecoguard-be`
- Roles minimal:
  - Cloud Build Editor
  - Artifact Registry Writer

Run trigger sekali sampai build SUCCESS. Image akan muncul di Artifact Registry dengan tag `$SHORT_SHA`.

## 4) Deploy backend ke Cloud Run (UI)

Cloud Run → Create service:

- Service name: `ecoguard-be`
- Region: `asia-southeast2`
- Deploy from: Container image → pilih image dari Artifact Registry `ecoguard-be:<SHORT_SHA>`
- Authentication:
  - Kalau backend dipakai frontend publik: biasanya **Allow unauthenticated**
  - Kalau mau private: Require authentication (nanti perlu auth/IAM)
- Billing: Request-based
- Min instances: 0

Set environment variables di “Variables & Secrets” (ambil dari `backend/.env.example`):

- `X_BEARER_TOKEN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`
- `GEMINI_API_KEY`
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

Tambahan yang ada di kode (kalau dipakai):

- `JWT_SECRET`
- `X_USERNAME`
- `TWITTERAPI_KEY`, `TWITTERAPI_UNAME`
- `DBSCAN_EPSILON`, `DBSCAN_MIN_PTS`

Deploy, lalu kamu akan dapat URL Cloud Run backend.

## 5) Hubungkan frontend ke backend

Setelah backend punya URL, update:

- Cloud Build Trigger frontend variable `_BACKEND_URL` → isi URL backend Cloud Run
- Run trigger frontend lagi → deploy revision frontend baru
