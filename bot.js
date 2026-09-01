const { Telegraf } = require('telegraf');
const config = require('./config.json');
const { getSession } = require('./utils/session');
const { backMenu, cancelButton } = require('./utils/keyboards');
const {
  handleStart,
  handleHelp,
  handleStatus,
  startSendlinkFlow,
  processEmail,
  processLink,
  handleCancel
} = require('./handlers/commands');
const { registerActions } = require('./handlers/actions');

const processedUpdates = new Set();
function isDuplicateUpdate(updateId) {
  if (!updateId) return false;
  if (processedUpdates.has(updateId)) return true;
  processedUpdates.add(updateId);
  if (processedUpdates.size > 1000) {
    const firstItem = processedUpdates.values().next().value;
    processedUpdates.delete(firstItem);
  }
  return false;
}

const bot = new Telegraf(config.BOT_TOKEN || '');

bot.use((ctx, next) => {
  if (ctx.update && ctx.update.update_id) {
    if (isDuplicateUpdate(ctx.update.update_id)) return;
  }
  return next();
});

bot.start((ctx) => handleStart(ctx));
bot.help((ctx) => handleHelp(ctx));
bot.command('status', (ctx) => handleStatus(ctx));

registerActions(bot);

bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const text = ctx.message.text.trim();
  const session = getSession(userId);

  if (!session.step) {
    if (text.startsWith('/')) {
      await ctx.reply(
        `<blockquote>Perintah yang Anda masukkan tidak terdaftar.</blockquote>\n\n` +
        `Gunakan perintah /help untuk melihat panduan penggunaan.`,
        { parse_mode: 'HTML', ...backMenu() }
      );
    }
    return;
  }

  let handled = false;
  if (session.step === 'ask_email') {
    handled = await processEmail(ctx, text);
  } else if (session.step === 'ask_link') {
    handled = await processLink(ctx, text);
  }

  if (!handled) {
    await ctx.reply(
      `Format pesan tidak sesuai alur. Silakan masukkan data yang diminta atau tekan tombol Batal.`,
      { parse_mode: 'HTML', ...cancelButton() }
    );
  }
});

module.exports = { bot };