const { escapeHtml, fetchApi, isOwner, isWhitelisted, addWhitelist, removeWhitelist, getWhitelist } = require('../utils/helpers');
const { getSession, clearSession } = require('../utils/session');
const { mainMenu, backMenu, cancelButton, loadingMessage } = require('../utils/keyboards');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function handleStart(ctx) {
  await ctx.replyWithChatAction('typing');
  const user = ctx.from;
  const firstName = escapeHtml(user.first_name || '');
  const lastName = escapeHtml(user.last_name || '');
  const fullName = (firstName + (lastName ? ' ' + lastName : '')).trim() || 'User';
  const username = user.username ? `@${escapeHtml(user.username)}` : 'Tidak tersedia';
  const userId = user.id;

  const caption =
    `<b>𝙸𝚜𝚊𝚊𝚠 ダッシュボード</b>\n` +
    `----------------------------------------\n\n` +
    `<pre><code>[ INFORMASI PENGGUNA ]</code></pre>\n` +
    `• Nama     : ${fullName}\n` +
    `• Username : ${username}\n` +
    `• ID User  : <code>${userId}</code>\n\n` +
    `<pre><code>[ PILIHAN MENU ]</code></pre>\n` +
    `Silakan pilih layanan di bawah ini:`;

  const imageUrl = require('../config.json').START_IMAGE_URL;
  if (imageUrl && imageUrl.trim().length > 0) {
    try {
      await ctx.replyWithPhoto(imageUrl.trim(), {
        caption: caption,
        parse_mode: 'HTML',
        ...mainMenu()
      });
      return;
    } catch (err) { }
  }
  await ctx.reply(caption, { parse_mode: 'HTML', ...mainMenu() });
}

async function handleHelp(ctx) {
  const text = `<pre><code>[ PANDUAN PENGGUNAAN ]</code></pre>\n\n` +
    `<blockquote>Gunakan fitur sesuai kebutuhan. Pastikan data yang dikirimkan sudah benar.</blockquote>\n\n` +
    `• /status - Memeriksa status dan kuota API Key (hanya owner)\n` +
    `• Kirim Link - Menerima link verifikasi via email\n` +
    `• /wlid - Kelola daftar akses (owner only)\n\n` +
    `Gunakan tombol navigasi di bawah untuk kembali ke menu utama.`;
  await ctx.reply(text, { parse_mode: 'HTML', ...backMenu() });
}

async function handleStatus(ctx) {
  const userId = ctx.from.id;
  if (!isOwner(userId)) {
    return ctx.reply(
      `<blockquote>Akses ditolak. Fitur ini hanya untuk pemilik bot.</blockquote>`,
      { parse_mode: 'HTML', ...backMenu() }
    );
  }

  const loading = await ctx.reply(`⏳ Sedang memeriksa status API...`, { parse_mode: 'HTML' });

  const res = await fetchApi('/api/key/status');
  await ctx.deleteMessage(loading.message_id).catch(() => {});

  if (!res.ok) {
    return ctx.reply(
      `<blockquote>Pemeriksaan status API gagal dilakukan.</blockquote>\n\n` +
      `Keterangan: ${escapeHtml(res.error)}`,
      { parse_mode: 'HTML', ...backMenu() }
    );
  }

  const data = res.data || {};
  const pkg = escapeHtml(data.package || data.plan || 'Standard');
  const dailyUsage = data.dailyUsage ?? 0;
  const dailyLimit = data.dailyLimit ?? 'Unlimited';
  const usageCount = data.usageCount ?? data.totalUsage ?? 0;

  let replyMsg = `<pre><code>[ STATUS API KEY ]</code></pre>\n\n` +
    `Status System  : <b>${data.active ? 'Aktif' : 'Tidak Aktif'}</b>\n` +
    `Paket Layanan  : <code>${pkg}</code>\n` +
    `Penggunaan Hari Ini : <code>${dailyUsage}/${dailyLimit}</code>\n` +
    `Total Penggunaan    : <code>${usageCount}</code>\n`;

  if (data.expiresAt) {
    try {
      const dateObj = new Date(data.expiresAt);
      const formattedDate = dateObj.toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      replyMsg += `Masa Berlaku    : <code>${escapeHtml(formattedDate)} WIB</code>\n`;
    } catch (e) {
      replyMsg += `Masa Berlaku    : <code>${escapeHtml(String(data.expiresAt))}</code>\n`;
    }
  }

  if (data.isCustom !== undefined) {
    replyMsg += `Jenis API Key   : <code>${data.isCustom ? 'Custom' : 'Standard'}</code>\n`;
  }

  await ctx.reply(replyMsg, { parse_mode: 'HTML', ...backMenu() });
}

async function startSendlinkFlow(ctx) {
  const userId = ctx.from.id;
  if (!isWhitelisted(userId)) {
    return ctx.reply(
      `<blockquote>Maaf, Anda tidak memiliki akses ke fitur ini.</blockquote>`,
      { parse_mode: 'HTML', ...backMenu() }
    );
  }

  const session = getSession(userId);
  session.step = 'ask_email';
  session.email = null;
  session.lastMessageId = null;

  await ctx.deleteMessage().catch(() => {});
  const msg = await ctx.reply(
    `Masukkan alamat email Anda untuk menerima link verifikasi.\n\n` +
    `Contoh: <code>user@gmail.com</code>`,
    { parse_mode: 'HTML', ...cancelButton() }
  );
  session.lastMessageId = msg.message_id;
}

async function processEmail(ctx, text) {
  const userId = ctx.from.id;
  const session = getSession(userId);
  if (session.step !== 'ask_email') return false;

  await ctx.deleteMessage().catch(() => {});

  if (session.lastMessageId) {
    await ctx.deleteMessage(session.lastMessageId).catch(() => {});
  }

  const email = text.trim();
  if (!EMAIL_REGEX.test(email)) {
    const msg = await ctx.reply(
      `Format alamat email tidak valid. Silakan masukkan email yang benar.\n\n` +
      `Contoh: <code>user@gmail.com</code>`,
      { parse_mode: 'HTML', ...cancelButton() }
    );
    session.lastMessageId = msg.message_id;
    return true;
  }

  session.email = email;

  const loading = await ctx.reply(`⏳ Mengirim link verifikasi ke ${escapeHtml(email)}...`, { parse_mode: 'HTML' });
  await new Promise(resolve => setTimeout(resolve, 5000));
  await ctx.deleteMessage(loading.message_id).catch(() => {});

  const res = await fetchApi('/api/am/sendlink', { email });
  if (!res.ok) {
    const msg = await ctx.reply(
      `<blockquote>Gagal mengirimkan link verifikasi.</blockquote>\n\n` +
      `Keterangan: ${escapeHtml(res.error)}`,
      { parse_mode: 'HTML', ...cancelButton() }
    );
    session.lastMessageId = msg.message_id;
    return true;
  }

  const msg = await ctx.reply(
    `<blockquote>Link verifikasi berhasil dikirimkan ke email Anda.</blockquote>\n\n` +
    `Alamat Email: <code>${escapeHtml(email)}</code>\n\n` +
    `Silakan periksa folder Inbox atau Spam. Setelah menerima pesan, kirimkan link verifikasi tersebut ke bot ini.\n\n` +
    `Contoh format link: <code>https://alight-creative.com/XXXXXXXX</code>`,
    { parse_mode: 'HTML', ...cancelButton() }
  );

  session.step = 'ask_link';
  session.lastMessageId = msg.message_id;
  return true;
}

async function processLink(ctx, text) {
  const userId = ctx.from.id;
  const session = getSession(userId);
  if (session.step !== 'ask_link') return false;

  await ctx.deleteMessage().catch(() => {});

  if (session.lastMessageId) {
    await ctx.deleteMessage(session.lastMessageId).catch(() => {});
  }

  const link = text.trim();
  if (!link) {
    const msg = await ctx.reply(
      `Link verifikasi tidak boleh kosong. Kirimkan link verifikasi yang valid.`,
      { parse_mode: 'HTML', ...cancelButton() }
    );
    session.lastMessageId = msg.message_id;
    return true;
  }

  const loading = await ctx.reply(`⏳ Memproses verifikasi...`, { parse_mode: 'HTML' });
  await new Promise(resolve => setTimeout(resolve, 5000));
  await ctx.deleteMessage(loading.message_id).catch(() => {});

  const res = await fetchApi('/api/amp/reqprem', { email: session.email, link });
  if (!res.ok) {
    const msg = await ctx.reply(
      `<blockquote>Proses verifikasi gagal.</blockquote>\n\n` +
      `Keterangan: ${escapeHtml(res.error)}`,
      { parse_mode: 'HTML', ...cancelButton() }
    );
    session.lastMessageId = msg.message_id;
    return true;
  }

  const data = res.data || {};
  const plan = escapeHtml(data.plan || data.package || 'Premium');

  let replyMsg = `<blockquote>Verifikasi Berhasil Diproses</blockquote>\n\n` +
    `<pre><code>[ STATUS PREMIUM ]</code></pre>\n` +
    `• Email  : <code>${escapeHtml(session.email)}</code>\n` +
    `• Paket  : <b>${plan}</b>\n` +
    `• Status : <b>Aktif</b>\n`;

  if (data.activatedAt) {
    replyMsg += `• Aktif Sejak : <code>${escapeHtml(String(data.activatedAt))}</code>\n`;
  }
  if (data.premiumExpiresAt || data.expiresAt) {
    const expires = data.premiumExpiresAt || data.expiresAt;
    replyMsg += `• Berakhir    : <code>${escapeHtml(String(expires))}</code>\n`;
  }

  clearSession(userId);
  await ctx.reply(replyMsg, { parse_mode: 'HTML', ...backMenu() });
  return true;
}

async function handleCancel(ctx) {
  const userId = ctx.from.id;
  const session = getSession(userId);
  if (session.lastMessageId) {
    await ctx.deleteMessage(session.lastMessageId).catch(() => {});
  }
  clearSession(userId);
  await ctx.deleteMessage().catch(() => {});
  await handleStart(ctx);
}

async function handleWlid(ctx) {
  const userId = ctx.from.id;
  if (!isOwner(userId)) {
    return ctx.reply(
      `<blockquote>Akses ditolak. Perintah ini hanya untuk pemilik bot.</blockquote>`,
      { parse_mode: 'HTML', ...backMenu() }
    );
  }

  const args = ctx.message.text.split(' ');
  if (args.length < 2) {
    return ctx.reply(
      `<pre><code>[ CARA PENGGUNAAN /wlid ]</code></pre>\n\n` +
      `• /wlid list - Menampilkan daftar ID yang diizinkan\n` +
      `• /wlid add [ID] - Menambahkan ID ke daftar putih\n` +
      `• /wlid remove [ID] - Menghapus ID dari daftar putih`,
      { parse_mode: 'HTML', ...backMenu() }
    );
  }

  const sub = args[1].toLowerCase();
  const targetId = parseInt(args[2]);

  if (sub === 'list') {
    const list = getWhitelist();
    if (list.length === 0) {
      return ctx.reply(`Daftar putih kosong.`, { parse_mode: 'HTML', ...backMenu() });
    }
    const msg = `Daftar ID yang diizinkan:\n${list.map(id => `• ${id}`).join('\n')}`;
    return ctx.reply(msg, { parse_mode: 'HTML', ...backMenu() });
  }

  if (isNaN(targetId) || targetId <= 0) {
    return ctx.reply(
      `ID harus berupa angka positif.`,
      { parse_mode: 'HTML', ...backMenu() }
    );
  }

  if (sub === 'add') {
    if (addWhitelist(targetId)) {
      return ctx.reply(`ID ${targetId} berhasil ditambahkan ke daftar putih.`, { parse_mode: 'HTML', ...backMenu() });
    } else {
      return ctx.reply(`ID ${targetId} sudah ada dalam daftar putih.`, { parse_mode: 'HTML', ...backMenu() });
    }
  } else if (sub === 'remove') {
    if (removeWhitelist(targetId)) {
      return ctx.reply(`ID ${targetId} berhasil dihapus dari daftar putih.`, { parse_mode: 'HTML', ...backMenu() });
    } else {
      return ctx.reply(`ID ${targetId} tidak ditemukan dalam daftar putih.`, { parse_mode: 'HTML', ...backMenu() });
    }
  } else {
    return ctx.reply(
      `Sub perintah tidak dikenali. Gunakan list, add, atau remove.`,
      { parse_mode: 'HTML', ...backMenu() }
    );
  }
}

module.exports = {
  handleStart,
  handleHelp,
  handleStatus,
  startSendlinkFlow,
  processEmail,
  processLink,
  handleCancel,
  handleWlid
};