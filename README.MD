# 🤖 Bo Telegram Alightmotion Premium

Telegram bot untuk verifikasi akun **Alight Motion Premium** menggunakan REST API [iSaaw Quality Project](https://skyp.isaaw.web.id). Bot ini mendukung interaksi berbasis tombol dan alur percakapan yang ramah pengguna.

![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat&logo=node.js)
![Telegraf](https://img.shields.io/badge/Telegraf-4.16+-blue?style=flat&logo=telegram)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ✨ Fitur

- **Menu interaktif** dengan tombol inline
- **Kirim link verifikasi** ke email (alur percakapan)
- **Verifikasi premium** otomatis setelah link diterima
- **Cek status API key** (paket, kuota harian, masa berlaku)
- **Bantuan** dan panduan penggunaan
- **Session** per pengguna untuk menjaga alur verifikasi
- **Rate limiting & retry** otomatis saat API overload
- **Deduplikasi update** (mencegah proses ganda)

---

## 🚀 Prasyarat

- **Node.js** versi 18 atau lebih baru
- **npm** atau **yarn**
- Akun Telegram dan **Bot Token** (dari [@BotFather](https://t.me/BotFather))
- **API Key** dari [iSaaw Quality Project](https://skyp.isaaw.web.id)

---

## 📦 Instalasi

1. **Clone repository**
   ```bash
   git clone https://github.com/username/isaaw-premium-bot.git
   cd isaaw-premium-bot
