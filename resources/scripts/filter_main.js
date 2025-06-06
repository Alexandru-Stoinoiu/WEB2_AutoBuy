import { openProductModal, setupModalEvents } from './modal.js';

document.addEventListener("DOMContentLoaded", () => {
  fetch('categories/modal.html')
    .then(res => res.text())
    .then(html => {
      document.body.insertAdjacentHTML('afterbegin', html);
      setupModalEvents();

      const productList = document.getElementById('product-list');

      function renderProducts(products) {
        productList.innerHTML = "";
        products.forEach(p => {
          const div = document.createElement('div');
          div.className = 'product-card';
          div.innerHTML = `
            <img src="${p.imageUrl || ''}" alt="${p.name}" class="product-img" style="width:100%;height:180px;object-fit:cover;">
            <div>${p.name}</div>
          `;
          div.addEventListener('click', () => {
            let userId = null;
            const user = JSON.parse(localStorage.getItem('currentUser'));
            if (user && user.id) userId = user.id;
            openProductModal(p, userId);
          });
          productList.appendChild(div);
        });
      }

      fetch('http://localhost:5145/api/products')
        .then(res => res.json())
        .then(products => {
          const topRated = products
            .slice()
            .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || a.name.localeCompare(b.name))
            .slice(0, 5);
          renderProducts(topRated);
        })
        .catch(err => {
          productList.innerHTML = "<p style='color:red'>Nu s-au putut încărca produsele.</p>";
          console.error(err);
        });
    });
});