# 𝙸𝚜𝚊𝚊𝚠 ダッシュボード

> Telegram Bot untuk verifikasi **Alight Motion Premium 1 Tahun** melalui REST API **iSaaw Quality Project**.

![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)
![Telegraf](https://img.shields.io/badge/Telegraf-4.16+-blue?logo=telegram)
![Vercel](https://img.shields.io/badge/Vercel-Ready-black?logo=vercel)
![License](https://img.shields.io/badge/License-MIT-yellow)

## Fitur

* Menu inline Telegram
* Verifikasi melalui email & link
* Session per pengguna
* Whitelist pengguna
* Owner-only `/status` & `/wlid`
* Cek status API Key
* Retry otomatis saat API `429`
* Webhook Secret
* Polling untuk lokal
* Webhook untuk Vercel
* Support Windows, Linux, macOS, Termux & VPS

---

## Requirements

* Node.js `18+`
* npm
* Telegram Bot Token
* iSaaw API Key

---

## Instalasi

```bash
git clone https://github.com/isaaw404/Bot-premium-alightmotion.git
cd Bot-premium-alightmotion
npm install
```

---

## Konfigurasi

Buat `config.json`:

```json
{
  "BOT_TOKEN": "YOUR_BOT_TOKEN",
  "SAAW_KEY": "YOUR_API_KEY",
  "API_BASE_URL": "https://skyp.isaaw.web.id",
  "WEBHOOK_SECRET": "YOUR_WEBHOOK_SECRET",
  "WEBHOOK_PATH": "/api/webhook",
  "START_IMAGE_URL": "",
  "OWNER_ID": 123456789,
  "WHITELIST": [
    123456789
  ]
}
```

> Jangan upload `BOT_TOKEN`, `SAAW_KEY`, atau `WEBHOOK_SECRET` ke repository publik.

---

## Menjalankan Lokal

Bot menggunakan polling saat dijalankan secara lokal.

```bash
npm start
```

atau:

```bash
node index.js
```

Cocok untuk testing melalui:

* Windows / PowerShell
* Linux
* macOS
* Termux
* VPS

Jika sebelumnya menggunakan webhook, hapus webhook terlebih dahulu:

```bash
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/deleteWebhook"
```

---

## Deploy ke Vercel

Install Vercel CLI:

```bash
npm install -g vercel
```

Login:

```bash
vercel login
```

Deploy:

```bash
vercel --prod
```

Setelah deploy, misalnya:

```text
https://nama-project.vercel.app
```

Endpoint webhook:

```text
https://nama-project.vercel.app/api/webhook
```

Tambahkan konfigurasi pada **Vercel → Project → Settings → Environment Variables**:

```text
BOT_TOKEN
SAAW_KEY
API_BASE_URL
WEBHOOK_SECRET
WEBHOOK_PATH
START_IMAGE_URL
OWNER_ID
WHITELIST
```

Lalu lakukan redeploy setelah mengubah Environment Variables.

---

## Set Telegram Webhook

Gunakan:

```bash
curl -X POST \
  "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
  -d "url=https://nama-project.vercel.app/api/webhook" \
  -d "secret_token=<WEBHOOK_SECRET>"
```

Cek webhook:

```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
```

Pastikan `url` sudah mengarah ke:

```text
https://nama-project.vercel.app/api/webhook
```

---

## Command

```text
/start   Dashboard utama
/help    Panduan penggunaan
/status  Status API Key (owner)
/wlid    Kelola whitelist (owner)
```

### Whitelist

```text
/wlid list
/wlid add 123456789
/wlid remove 123456789
```

---

## Alur Verifikasi

```text
Kirim Link Verifikasi
        ↓
Masukkan Email
        ↓
Link dikirim ke Email
        ↓
Kirim Link Verifikasi
        ↓
REST API
        ↓
Premium Berhasil Diproses
```

---

## Struktur

```text
├── api/
│   └── webhook.js
├── handlers/
│   ├── actions.js
│   └── commands.js
├── utils/
│   ├── helpers.js
│   ├── keyboards.js
│   └── session.js
├── bot.js
├── index.js
├── config.json
├── package.json
└── vercel.json
```

---

## License

MIT License

© 2026 𝙸𝚜𝚊𝚊𝚠
