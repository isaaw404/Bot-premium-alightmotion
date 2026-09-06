const { getConfig } = require('../utils/helpers');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(404).json({ error: 'Not Found' });
  }

  const config = getConfig();
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
      await require('../bot').bot.handleUpdate(update);
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[ERROR] Gagal memproses update webhook:', err.message);
    return res.status(200).json({ ok: true });
  }
};