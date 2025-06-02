const users = {
  'mod1': { password: 'admin', role: 'moderator' }
};

async function login(username, password) {
  const res = await fetch('http://localhost:5145/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  if (res.ok) {
    const user = await res.json();
    console.log('Backend user object:', user); // Debug line

    // Use both possible casings for robustness
    const name = user.Name || user.name || '';
    const uname = user.Username || user.username || username;

    localStorage.setItem('currentUser', JSON.stringify({ username: uname, name: name, role: 'user' }));
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
    // Fallback: show name, then username, then "Utilizator"
    const displayName = user.name || user.username || "Utilizator";
    controls.innerHTML = `
      <div style="text-align: right; color: white;">
        <strong>Bun venit, ${displayName} (${user.role})</strong><br/>
        <button onclick="logout()" class="nav-auth" style="margin-top: 5px;">Ieșire</button>
      </div>
    `;
  }
});
