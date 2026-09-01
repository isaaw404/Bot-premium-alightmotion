const {
  handleStart,
  handleHelp,
  handleStatus,
  startSendlinkFlow,
  handleCancel
} = require('./commands');

function registerActions(bot) {
  bot.action('menu', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.deleteMessage().catch(() => {});
    await handleStart(ctx);
  });

  bot.action('help', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.deleteMessage().catch(() => {});
    await handleHelp(ctx);
  });

  bot.action('status', async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.deleteMessage().catch(() => {});
    await handleStatus(ctx);
  });

  bot.action('sendlink', async (ctx) => {
    await ctx.answerCbQuery();
    await startSendlinkFlow(ctx);
  });

  bot.action('cancel', async (ctx) => {
    await ctx.answerCbQuery();
    await handleCancel(ctx);
  });
}

module.exports = { registerActions };