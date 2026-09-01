# Telegram Bot REST API & Verification System

Template Telegram Bot modular berbasis Node.js dan Telegraf.js yang dirancang untuk integrasi REST API backend, manajemen sesi pengguna, alur verifikasi email, serta pemantauan status API Key. Mendukung dua mode eksekusi: Long Polling untuk server VPS/Lokal dan Webhook serverless untuk platform cloud seperti Vercel.

---

## Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Struktur Proyek](#struktur-proyek)
- [Prasyarat Sistem](#prasyarat-sistem)
- [Panduan Instalasi](#panduan-instalasi)
- [Konfigurasi System](#konfigurasi-system)
- [Cara Menjalankan](#cara-menjalankan)
  - [Mode Polling (Lokal / VPS)](#1-mode-polling-lokal--vps)
  - [Mode Webhook (Vercel Serverless)](#2-mode-webhook-vercel-serverless)
- [Alur Kerja Sistem](#alur-kerja-sistem)
- [Lisensi](#lisensi)

---

## Fitur Utama

- **Integrasi REST API**: Terhubung langsung ke backend server API menggunakan `fetch` native dengan mekanisme penanganan timeout dan retry otomatis.
- **Dua Mode Eksekusi**: Siap dijalankan dalam mode Polling biasa maupun Webhook serverless Vercel.
- **Sistem Verifikasi Email**: Fitur interaktif dua langkah (*step-by-step session*) untuk pengiriman link verifikasi dan validasi URL tanggapan.
- **Pemeriksaan Status API**: Cek limit harian, total penggunaan, tanggal kedaluwarsa, dan status keaktifan API Key secara real-time.
- **Manajemen Sesi In-Memory**: Menangani *state* percakapan pengguna tanpa bergantung pada database eksternal.
- **Proteksi Deduplikasi**: Anti-duplicate middleware untuk mencegah pemrosesan update Telegram yang sama secara berulang.
- **Tampilan UI Bebas Emoji**: Antarmuka berbasis teks HTML clean yang konsisten dan tampak seperti sistem informasi profesional.

---

## Struktur Proyek

```text
.
├── api/
│   └── webhook.js        # Handler endpoint Webhook untuk Vercel
├── handlers/
│   ├── actions.js        # Event listener untuk callback query (tombol inline)
│   └── commands.js       # Logika utama command (/start, /help, /status, alur verifikasi)
├── utils/
│   ├── helpers.js        # Utility fungsi API fetch, formatting HTML, error handling
│   ├── keyboards.js      # Definisi susunan Inline Keyboard Telegram
│   └── session.js        # Manajemen state percakapan user
├── bot.js                # Inisialisasi Telegraf instance & routing middleware
├── config.json           # File konfigurasi kredensial & environment
├── index.js              # Entry point utama untuk mode Long Polling
└── package.json          # Dependency & script pengerjaan proyek