const { escapeHtml, fetchApi } = require('../utils/helpers');
const { getSession, clearSession } = require('../utils/session');
const { mainMenu, backMenu, cancelButton } = require('../utils/keyboards');
const config = require('../config.json');

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

  const imageUrl = config.START_IMAGE_URL;
  if (imageUrl && imageUrl.trim().length > 0) {
    try {
      await ctx.replyWithPhoto(imageUrl.trim(), {
        caption: caption,
        parse_mode: 'HTML',
        ...mainMenu()
      });
      return;
    } catch (err) { /* fallback */ }
  }
  await ctx.reply(caption, { parse_mode: 'HTML', ...mainMenu() });
}

async function handleHelp(ctx) {
  const text = `<pre><code>[ PANDUAN PENGGUNAAN ]</code></pre>\n\n` +
    `<blockquote>Gunakan fitur sesuai kebutuhan. Pastikan data yang dikirimkan sudah benar.</blockquote>\n\n` +
    `• /status - Memeriksa status dan kuota API Key\n` +
    `• Kirim Link - Menerima link verifikasi via email\n\n` +
    `Gunakan tombol navigasi di bawah untuk kembali ke menu utama.`;
  await ctx.reply(text, { parse_mode: 'HTML', ...backMenu() });
}

async function handleStatus(ctx) {
  if (!config.SAAW_KEY) {
    return ctx.reply(
      `<blockquote>Konfigurasi API Key belum disetting. Silakan hubungi administrator.</blockquote>`,
      { parse_mode: 'HTML', ...backMenu() }
    );
  }

  const res = await fetchApi('/api/key/status');
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
  const session = getSession(userId);
  session.step = 'ask_email';
  session.email = null;
  await ctx.deleteMessage().catch(() => {});
  await ctx.reply(
    `Masukkan alamat email Anda untuk menerima link verifikasi.\n\n` +
    `Contoh: <code>user@gmail.com</code>`,
    { parse_mode: 'HTML', ...cancelButton() }
  );
}

async function processEmail(ctx, text) {
  const userId = ctx.from.id;
  const session = getSession(userId);
  if (session.step !== 'ask_email') return false;

  const email = text.trim();
  if (!EMAIL_REGEX.test(email)) {
    await ctx.reply(
      `Format alamat email tidak valid. Silakan masukkan email yang benar.\n\n` +
      `Contoh: <code>user@gmail.com</code>`,
      { parse_mode: 'HTML', ...cancelButton() }
    );
    return true;
  }

  session.email = email;

  const res = await fetchApi('/api/am/sendlink', { email });
  if (!res.ok) {
    await ctx.reply(
      `<blockquote>Gagal mengirimkan link verifikasi.</blockquote>\n\n` +
      `Keterangan: ${escapeHtml(res.error)}`,
      { parse_mode: 'HTML', ...cancelButton() }
    );
    return true;
  }

  await ctx.reply(
    `<blockquote>Link verifikasi berhasil dikirimkan ke email Anda.</blockquote>\n\n` +
    `Alamat Email: <code>${escapeHtml(email)}</code>\n\n` +
    `Silakan periksa folder Inbox atau Spam. Setelah menerima pesan, kirimkan link verifikasi tersebut ke bot ini.\n\n` +
    `Contoh format link: <code>https://verif.link/abc123</code>`,
    { parse_mode: 'HTML', ...cancelButton() }
  );

  session.step = 'ask_link';
  return true;
}

async function processLink(ctx, text) {
  const userId = ctx.from.id;
  const session = getSession(userId);
  if (session.step !== 'ask_link') return false;

  const link = text.trim();
  if (!link) {
    await ctx.reply(
      `Link verifikasi tidak boleh kosong. Kirimkan link verifikasi yang valid.`,
      { parse_mode: 'HTML', ...cancelButton() }
    );
    return true;
  }

  const res = await fetchApi('/api/amp/reqprem', { email: session.email, link });
  if (!res.ok) {
    await ctx.reply(
      `<blockquote>Proses verifikasi gagal.</blockquote>\n\n` +
      `Keterangan: ${escapeHtml(res.error)}`,
      { parse_mode: 'HTML', ...cancelButton() }
    );
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
  clearSession(userId);
  await ctx.deleteMessage().catch(() => {});
  await handleStart(ctx);
}

module.exports = {
  handleStart,
  handleHelp,
  handleStatus,
  startSendlinkFlow,
  processEmail,
  processLink,
  handleCancel
};