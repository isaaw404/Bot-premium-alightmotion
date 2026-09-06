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
