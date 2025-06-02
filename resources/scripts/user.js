const users = {
  'user1': { password: '1234', role: 'user' },
  'mod1': { password: 'admin', role: 'moderator' }
};

function login(username, password) {
  if (users[username] && users[username].password === password) {
    localStorage.setItem('currentUser', JSON.stringify({ username, role: users[username].role }));
    window.location.href = '../index.html';
  } else {
    alert('Autentificare eșuată');
  }
}

function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = '../index.html';
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser')) || { role: 'guest' };
}

document.addEventListener("DOMContentLoaded", () => {
  const controls = document.getElementById('user-controls');
  if (!controls) return;
  const user = getCurrentUser();
  if (user.role === 'guest') {
  controls.innerHTML = `<a href="/categories/login.html" class="nav-auth">Autentificare</a>`;
} else {
  controls.innerHTML = `
    <div style="text-align: right; color: white;">
      <strong>Bun venit, ${user.username} (${user.role})</strong><br/>
      <button onclick="logout()" class="nav-auth" style="margin-top: 5px;">Ieșire</button>
    </div>
  `;
}
});
