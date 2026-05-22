# 📝 Daftar Rencana Perbaikan Project (TODO List)

Dokumen ini berisi daftar rencana peningkatan teknis yang dapat Anda kerjakan secara bertahap untuk menyempurnakan kualitas kode, performa, dan validitas akademis dari project Command Center / Dashboard ini.

--- 

## 🗺️ 1. Peningkatan Manajemen Data Wilayah (Geocoding & NLP)
- [x] **Pasang Dataset Wilayah Resmi Indonesia**:
  - Cari dan unduh data Kota/Kabupaten resmi berformat JSON (rekomendasi: gunakan repositori GitHub *cahyo-manggalla/indonesia-regions*).
  - Integrasikan ke dalam `FuzzyMatchService` untuk menggantikan daftar kota hardcoded `majorCities` saat ini agar mendukung pencarian seluruh Indonesia secara lengkap. [DONE]
- [x] **Optimasi Caching Koordinat Geocoding**:
  - Terapkan mekanisme caching lokal (misal menggunakan SQLite/Redis) untuk menyimpan koordinat lokasi yang sudah pernah dicari di OpenStreetMap (OSM).
  - *Kenapa*: OSM API gratis memiliki batas kecepatan (Rate Limit). Caching akan mencegah aplikasi Anda lambat atau diblokir akibat terlalu sering menanyakan lokasi yang sama. [DONE - Terintegrasi dengan Redis Cloud! ⚡]

---

## 📊 2. Peningkatan Kualitas Machine Learning (Clustering)
- [x] **Perbanyak Kalimat Jangkar K-Means**:
  - Tambahkan variasi kalimat referensi keluhan pada `analyzer.service.ts` agar klasifikasi isu via K-Means NLP menjadi lebih akurat. [DONE - Diubah menjadi referensi dinamis riil dari database Firestore! 🚀]
- [x] **Optimasi Parameter Spasial DBSCAN**:
  - Uji coba nilai parameter `epsilon` (radius) dan `minPoints` pada DBSCAN untuk menentukan seberapa dekat laporan warga harus berkelompok agar dianggap sebagai **Active Node (Hotspot)** yang valid di peta dashboard. [DONE - Dioptimalkan dengan radius presisi 3.0km & konfigurasi variabel lingkungan dinamis! 🗺️]

---

## 🤖 3. Optimasi Kecerdasan Buatan (Google Gemini AI)
- [x] **Buat Fallback Mekanisme Error**:
  - Buat penanganan error (*Error Handling*) jika batas kuota harian Gemini API Anda habis (*rate limit*).
  - *Solusi*: Jika API Gemini gagal, arahkan sistem agar otomatis menggunakan hasil klasifikasi cadangan dari K-Means saja sebagai cadangan (*graceful degradation*). [DONE - Terintegrasi dengan klasifikasi K-Means semi-supervised dan error try-catch cadangan otomatis! 🤖🛡️]

---

## 🔒 4. Keamanan & Konfigurasi Lingkungan
- [ ] **Amankan API Keys & Kunci Rahasia**:
  - Pastikan berkas `.env` Anda sudah terdaftar di `.gitignore` agar file kredensial penting (seperti kunci Firebase dan API Key Gemini) tidak sengaja ter-upload ke akun GitHub publik Anda.
