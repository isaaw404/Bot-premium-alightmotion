const { Markup } = require('telegraf');

function mainMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('Request Premium AM', 'sendlink')],
    [Markup.button.callback('Cek Status API', 'status')],
    [Markup.button.callback('Bantuan', 'help')]
  ]);
}

function backMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('Kembali ke Menu Utama', 'menu')]
  ]);
}

function cancelButton() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('Batal', 'cancel')]
  ]);
}

module.exports = { mainMenu, backMenu, cancelButton };