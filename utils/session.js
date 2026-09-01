const sessions = {};

function getSession(userId) {
  if (!sessions[userId]) {
    sessions[userId] = { step: null, email: null };
  }
  return sessions[userId];
}

function clearSession(userId) {
  delete sessions[userId];
}

module.exports = { getSession, clearSession };