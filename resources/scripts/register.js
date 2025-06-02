document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  const res = await fetch('http://localhost:5145/api/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, username, password })
  });

  const msg = document.getElementById('register-message');
  if (res.ok) {
    msg.style.color = 'green';
    msg.textContent = 'Cont creat cu succes! Poți să te autentifici.';
  } else {
    msg.style.color = 'red';
    msg.textContent = 'Eroare la înregistrare. Încearcă alt username.';
  }
});