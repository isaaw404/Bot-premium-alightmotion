const { bot } = require('../bot');
const config = require('../config.json');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const secretToken = config.WEBHOOK_SECRET;
  if (secretToken) {
    const headerSecret = req.headers['x-telegram-bot-api-secret-token'];
    if (headerSecret !== secretToken) {
      return res.status(403).json({ error: 'Unauthorized webhook request' });
    }
  }

  try {
    const update = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (update && update.update_id) {
      await bot.handleUpdate(update);
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[ERROR] Gagal memproses update webhook:', err.message);
    return res.status(200).json({ ok: true });
  }
};