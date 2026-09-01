const config = require('./config.json');
const { bot } = require('./bot');

if (!config.BOT_TOKEN || !config.SAAW_KEY) {
  console.error('[ERROR] BOT_TOKEN dan SAAW_KEY wajib diisi di file config.json!');
  process.exit(1);
}

if (process.env.VERCEL) {
  console.log('[INFO] Menjalankan di Vercel (mode webhook) - bot akan dijalankan via /api/webhook');
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