// Simulare autentificare
const users = {
  'user1': { password: '1234', role: 'user' },
  'mod1': { password: 'admin', role: 'moderator' }
};

function login(username, password) {
  if (users[username] && users[username].password === password) {
    localStorage.setItem('currentUser', JSON.stringify({ username, role: users[username].role }));
    window.location.href = 'index.html'; // redirecționează la pagina principală
  } else {
    alert('Autentificare eșuată');
  }
}

function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'index.html'; // redirecționează după delogare
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser')) || { role: 'guest' };
}

document.addEventListener("DOMContentLoaded", () => {
  const controls = document.getElementById('user-controls');
  if (!controls) return;
  const user = getCurrentUser();
  if (user.role === 'guest') {
    controls.innerHTML = `<a href="login.html" style="color: white; font-weight: bold; text-decoration: none;">Autentificare</a>`;
  } else {
    controls.innerHTML = `
      <div style="text-align: right; color: white;">
        <strong>Bun venit, ${user.username} (${user.role})</strong><br/>
        <button onclick="logout()" style="margin-top: 5px; padding: 5px 10px; border: none; border-radius: 4px; cursor: pointer;">Ieșire</button>
      </div>
    `;
  }
});
