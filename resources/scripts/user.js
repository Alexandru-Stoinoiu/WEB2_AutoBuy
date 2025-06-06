async function login(username, password) {
  const res = await fetch('http://localhost:5145/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  if (res.ok) {
    const user = await res.json();

    const id = user.Id || user.id;
    const name = user.Name || user.name || '';
    const uname = user.Username || user.username || username;
    const role = user.Role || user.role || 'user';

    localStorage.setItem('currentUser', JSON.stringify({ id: id, username: uname, name: name, role: role }));
    window.location.href = '/index.html';
  }
}

function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = '/index.html';
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser')) || { role: 'guest' };
}

document.addEventListener("DOMContentLoaded", () => {
  const controls = document.getElementById('user-controls');
  if (!controls) return;
  const user = getCurrentUser();
  if (user.role === 'guest') {
    controls.innerHTML = `<a href="/categories/pages/login.html" class="nav-auth">Autentificare</a>`;
  } else {
    const displayName = user.name || user.username || "Utilizator";
    let html = `
      <div style="text-align: right; color: white;">
        <strong>Bun venit, ${displayName} (${user.role})</strong><br/>
        <button onclick="logout()" class="nav-auth" style="margin-top: 5px;">Ieșire</button>
    `;

    if (user.role === 'moderator' || user.role === 'admin') {
      html += `
        <br/>
        <button onclick="window.location.href='/categories/pages/admin.html'" class="nav-auth" style="margin-top: 5px;">Panou Moderator</button>
      `;
    }

    html += `</div>`;
    controls.innerHTML = html;
  }
});