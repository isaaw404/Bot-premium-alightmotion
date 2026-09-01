const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../config.json');

function getConfig() {
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function saveConfig(config) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

function isOwner(userId) {
  const config = getConfig();
  return config.OWNER_ID === userId;
}

function isWhitelisted(userId) {
  const config = getConfig();
  return config.WHITELIST.includes(userId) || isOwner(userId);
}

function addWhitelist(userId) {
  const config = getConfig();
  if (!config.WHITELIST.includes(userId)) {
    config.WHITELIST.push(userId);
    saveConfig(config);
    return true;
  }
  return false;
}

function removeWhitelist(userId) {
  const config = getConfig();
  const index = config.WHITELIST.indexOf(userId);
  if (index !== -1) {
    config.WHITELIST.splice(index, 1);
    saveConfig(config);
    return true;
  }
  return false;
}

function getWhitelist() {
  const config = getConfig();
  return config.WHITELIST;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function fetchApi(endpoint, params = {}, retries = 3) {
  const config = getConfig();
  const baseUrl = (config.API_BASE_URL || 'https://skyp.isaaw.web.id').replace(/\/+$/, '');
  const url = new URL(endpoint, baseUrl);

  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      url.searchParams.append(key, val);
    }
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-API-Key': config.SAAW_KEY || '',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      },
      signal: controller.signal
    });
    clearTimeout(timeout);

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      console.error(`[API WARN] Response bukan JSON (${contentType}) dari ${url.toString()}`);
      return {
        ok: false,
        status: response.status,
        error: 'API mengembalikan halaman keamanan. Coba lagi nanti.'
      };
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      console.error(`[API ERROR] ${url.toString()} => ${response.status}`, data);
      if (response.status === 429 && retries > 0) {
        const retryAfter = parseInt(response.headers.get('retry-after') || '5', 10);
        const delay = Math.min(retryAfter * 1000, 30000);
        console.log(`[RETRY] Menunggu ${delay/1000} detik... (sisa ${retries-1} percobaan)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchApi(endpoint, params, retries - 1);
      }
      return {
        ok: false,
        status: response.status,
        error: getErrorMessage(response.status, data)
      };
    }

    return { ok: true, data };
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      return { ok: false, status: 504, error: 'Koneksi ke server API timeout. Silakan coba beberapa saat lagi.' };
    }
    console.error('[FETCH ERROR]', err.message);
    return { ok: false, status: 500, error: 'Gagal terhubung ke layanan API.' };
  }
}

function getErrorMessage(status, data) {
  if (data && typeof data.message === 'string' && data.message.trim()) {
    return data.message.trim();
  }
  switch (status) {
    case 400: return 'Parameter request tidak valid.';
    case 401: return 'Autentikasi API tidak valid. Periksa API Key Anda.';
    case 403: return 'API Key tidak aktif atau telah kedaluwarsa.';
    case 404: return 'Layanan atau data yang diminta tidak ditemukan.';
    case 429: return 'Batas permintaan terlampaui, silakan coba beberapa saat lagi.';
    case 500:
    case 503: return 'Terjadi kendala pada server API. Coba lagi nanti.';
    default: return 'Terjadi kesalahan sistem pada layanan API.';
  }
}

module.exports = { getConfig, saveConfig, isOwner, isWhitelisted, addWhitelist, removeWhitelist, getWhitelist, escapeHtml, fetchApi, getErrorMessage };