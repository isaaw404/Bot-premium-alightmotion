const { getConfig } = require('./utils/helpers');
const { bot } = require('./bot');

const config = getConfig();

if (!config.BOT_TOKEN || !config.SAAW_KEY) {
  console.error('[ERROR] BOT_TOKEN dan SAAW_KEY wajib diisi di file config.json atau environment variables!');
  process.exit(1);
}

if (process.env.VERCEL) {
  console.log('[INFO] Menjalankan di Vercel (mode webhook)');

  if (process.env.VERCEL_ENV === 'production') {
    const VERCEL_URL = process.env.VERCEL_URL;
    if (!VERCEL_URL) {
      console.error('[ERROR] VERCEL_URL tidak ditemukan di environment Vercel');
    } else {
      const webhookPath = config.WEBHOOK_PATH || '/api/webhook';
      const webhookUrl = `https://${VERCEL_URL}${webhookPath}`;
      console.log(`[INFO] Mendaftarkan webhook ke ${webhookUrl}`);

      bot.telegram.getWebhookInfo()
        .then(info => {
          if (info.url === webhookUrl && info.has_custom_certificate === false) {
            console.log('[INFO] Webhook sudah terdaftar dengan URL yang sama, skip.');
          } else {
            return bot.telegram.setWebhook(webhookUrl, {
              secret_token: config.WEBHOOK_SECRET
            }).then(() => {
              console.log('[INFO] Webhook berhasil didaftarkan.');
            });
          }
        })
        .catch(err => {
          console.error('[ERROR] Gagal mendaftarkan webhook:', err.message);
        });
    }
  }

  module.exports = { bot };
} else {
  console.log('Menjalankan Telegram Bot (Mode Polling)...');
  bot.launch({
    dropPendingUpdates: true
  }).then(() => {
    console.log('Bot berhasil aktif! Tekan Ctrl+C untuk menghentikan.');
  }).catch((err) => {
    console.error('[ERROR] Gagal menjalankan bot polling:', err.message);
  });

  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}