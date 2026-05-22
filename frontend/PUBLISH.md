
# Publish Frontend (Angular SSR) ke Google Cloud (GCP)

Project ini adalah Angular SSR (output `dist/frontend/browser` + `dist/frontend/server`) dan dijalankan oleh Node/Express lewat `dist/frontend/server/server.mjs`.

Environment variable yang dipakai:

- `BACKEND_URL` → dipakai oleh frontend untuk base URL API (lihat [api.service.ts](file:///Volumes/Drive/Personal/Project/Vibe%20Coding%20-%20Google%20Event/frontend/src/app/shared/services/api.service.ts#L1-L38))
- `PORT` → port server SSR (Cloud Run akan otomatis set `PORT`)

## Pilih cara deploy

- **Cara A: Dengan gcloud CLI** (jalankan command lewat Terminal lokal atau Cloud Shell)
- **Cara B: Tanpa gcloud CLI** (pakai UI Console + Cloud Build/Cloud Run)

Di dua cara ini, best practice untuk `.env` tetap sama: **jangan upload file `.env`**, gunakan **Cloud Run env vars** / **Secret Manager**.

## A) Dengan gcloud CLI

### A0) Prasyarat

- Sudah punya **GCP Project** + **Billing aktif**
- Install **gcloud CLI** (kalau pakai Cloud Shell, sudah tersedia)
- Install Docker (opsional kalau build image-nya pakai Cloud Build, bukan local)

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

### A2) Test build & run SSR di lokal (opsional tapi direkomendasikan)

```bash
npm ci
npm run build
PORT=4000 node dist/frontend/server/server.mjs
```

### A3) Buat Artifact Registry

Set variabel yang dipakai:

```bash
PROJECT_ID="<PROJECT_ID>"
REGION="asia-southeast2"
REPO="frontend-repo"
SERVICE="google-event-frontend"
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

### A4) Dockerfile (multi-stage) untuk Angular SSR

Buat file `Dockerfile` di root project (`frontend/Dockerfile`) dengan isi berikut:

```Dockerfile
# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Inject env saat build (untuk code browser bundle yang memakai process.env)
ARG BACKEND_URL
ENV BACKEND_URL=$BACKEND_URL

RUN npm run build

# ---- Runtime stage ----
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

# Cloud Run akan set PORT otomatis, default di server.ts adalah 4000
ENV PORT=8080

# Set juga BACKEND_URL di runtime (untuk SSR/server side)
ARG BACKEND_URL
ENV BACKEND_URL=$BACKEND_URL

COPY --from=build /app/dist ./dist

EXPOSE 8080
CMD ["node", "dist/frontend/server/server.mjs"]
```

Kenapa ada `ARG/ENV BACKEND_URL` dua kali?

- Saat `npm run build`: supaya nilai `process.env['BACKEND_URL']` kebawa ke bundle browser (build-time).
- Saat runtime: supaya SSR/server juga baca `BACKEND_URL` dari environment.

### A5) Build & push image

Pilih tag image:

```bash
TAG="v1"
IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/$SERVICE:$TAG"
```

#### A5a) Build pakai Docker lokal

```bash
docker build \
  --build-arg BACKEND_URL="https://<DOMAIN_BACKEND_PROD>" \
  -t "$IMAGE" \
  .

docker push "$IMAGE"
```

#### A5b) Build tanpa Docker lokal (pakai Cloud Build)

```bash
gcloud builds submit \
  --config=- \
  --substitutions=_BACKEND_URL="https://<DOMAIN_BACKEND_PROD>",_IMAGE="$IMAGE" \
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

### A6) Deploy ke Cloud Run

```bash
gcloud run deploy "$SERVICE" \
  --image "$IMAGE" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "BACKEND_URL=https://<DOMAIN_BACKEND_PROD>"
```

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

- Source: GitHub → pilih repo + branch
- Configuration: `Dockerfile`
- Dockerfile directory: `/` (root `frontend`)
- Image (Artifact Registry): pilih repo `frontend-repo`, lalu set image name `google-event-frontend` dan tag (mis. `v1`)

Set `BACKEND_URL`:

- Di build trigger, kalau UI mendukung build args/substitutions, isi `BACKEND_URL` supaya kebawa saat build.
- Kalau UI kamu tidak menyediakan build arg, minimal set `BACKEND_URL` di runtime Cloud Run (langkah B5). (Catatan: untuk project ini, build-time injection lebih aman agar bundle browser konsisten.)

Jalankan trigger sekali untuk menghasilkan image di Artifact Registry.

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
