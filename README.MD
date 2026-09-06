# Isaaw Premium Bot — Telegram Bot with Auto Webhook (Vercel)

Bot Telegram untuk layanan **Request Premium AM** dan pengecekan status API, dilengkapi dengan sistem whitelist, owner-only commands, serta mekanisme **auto-registration webhook** saat dideploy ke Vercel Production.

## Fitur Utama

- ✅ **Start Menu** dengan informasi pengguna dan tombol navigasi.
- ✅ **Request Premium** – kirim email, verifikasi link, dan aktifkan premium.
- ✅ **Cek Status API** – lihat kuota, paket, masa berlaku (khusus owner).
- ✅ **Manajemen Whitelist** – tambah/hapus/lihat daftar ID yang diizinkan (khusus owner).
- ✅ **Session per user** – alur input email dan link.
- ✅ **Auto Webhook** – saat deploy ke Vercel Production, webhook Telegram otomatis terdaftar tanpa perintah manual.
- ✅ **Mode Polling** – untuk menjalankan bot secara lokal.
- ✅ **Keamanan** – verifikasi `X-Telegram-Bot-Api-Secret-Token`, response generik untuk endpoint publik, dan tidak ada bocoran informasi internal.

---

## Prasyarat

- Node.js **v18+**
- Akun [Vercel](https://vercel.com) (untuk deployment webhook)
- Bot Telegram (dapatkan token dari [@BotFather](https://t.me/botfather))
- API Key dari layanan backend (dalam konfigurasi `SAAW_KEY`)

---

## Instalasi & Konfigurasi Lokal

1. **Clone repository**

   ```bash
   git clone https://github.com/username/isaaw-premium-bot.git
   cd isaaw-premium-bot

2. **Install dependencies**

```bash
npm install

3. **Buat file config.json (gunakan contoh di bawah)**

```bash
{
  "BOT_TOKEN": "TOKEN BOT DAPAT DI t.me/@BotFather",
  "SAAW_KEY": "APIKEY DARI WEB",
  "API_BASE_URL": "https://skyp.isaaw.web.id",
  "WEBHOOK_SECRET": "BIKINNYA DI COMMAND", //-join (1..32 | ForEach-Object { '{0:X2}' -f (Get-Random -Minimum 0 -Maximum 256) })
  "WEBHOOK_PATH": "/api/webhook",
  "START_IMAGE_URL": "https://CONTOH.COM/start-image.jpg",
  "OWNER_ID": 1234567890,
  "WHITELIST": [987654321]
}

3. **Jalankan bot secara lokal (mode polling)**

```bash
npm start


