# Isaaw Premium Bot

Bot Telegram untuk layanan Request Premium AM dan pengecekan status API. Dilengkapi sistem whitelist, owner-only commands, serta auto-registration webhook saat dideploy ke Vercel Production.

---

## Fitur Utama

- Start Menu — Menu interaktif dengan informasi pengguna dan tombol navigasi.
- Request Premium — Alur otomatis input email, verifikasi link, dan aktivasi.
- Cek Status API — Pemantauan kuota, jenis paket, dan masa berlaku (Khusus Owner).
- Manajemen Whitelist — Kontrol akses tambah, hapus, dan lihat ID terdaftar (Khusus Owner).
- Session Management — Menjaga status interaksi per user selama proses request.
- Auto Webhook — Pendaftaran webhook Telegram otomatis saat deploy ke Vercel.
- Mode Polling — Opsi menjalankan bot secara lokal untuk kebutuhan pengujian.
- Keamanan — Proteksi header X-Telegram-Bot-Api-Secret-Token dan respon generik pada endpoint publik.

---

## Prasyarat

- Node.js v18+
- Akun Vercel (https://vercel.com) (untuk mode webhook/production)
- Bot Token dari @BotFather (https://t.me/botfather)
- API Key backend (SAAW_KEY)

---

## Instalasi & Penggunaan Lokal

### 1. Clone & Install
git clone https://github.com/isaaw404/Bot-premium-alightmotion.git
cd isaaw-premium-bot
npm install

### 2. Konfigurasi (config.json)
Buat file config.json di root direktori proyek:

{
  "BOT_TOKEN": "YOUR_TELEGRAM_BOT_TOKEN",
  "SAAW_KEY": "YOUR_BACKEND_API_KEY",
  "API_BASE_URL": "https://skyp.isaaw.web.id",
  "WEBHOOK_SECRET": "YOUR_RANDOM_SECRET_KEY",
  "WEBHOOK_PATH": "/api/webhook",
  "START_IMAGE_URL": "https://example.com/start-image.jpg",
  "OWNER_ID": 1234567890,
  "WHITELIST": [987654321]
}

Catatan WEBHOOK_SECRET:
Untuk membuat string acak via PowerShell:
-join (1..32 | ForEach-Object { '{0:X2}' -f (Get-Random -Minimum 0 -Maximum 256) })

### 3. Jalankan Bot (Mode Polling)
npm start

---

## Deploy ke Vercel

1. Push repository ini ke akun GitHub Anda.
2. Import repository di dashboard Vercel.
3. Atur Environment Variables sesuai parameter di config.json.
4. Deploy. Webhook Telegram akan otomatis terkonfigurasi setelah deployment selesai.
