import { openProductModal, setupModalEvents } from './modals/modal.js';

document.addEventListener("DOMContentLoaded", () => {
  fetch('../modals/modal.html')
    .then(res => res.text())
    .then(html => {
      document.body.insertAdjacentHTML('afterbegin', html);
      setupModalEvents();

      const productList = document.getElementById('product-list');
      const searchBox = document.getElementById('search-box');
      const minPriceInput = document.getElementById('min-price');
      const maxPriceInput = document.getElementById('max-price');
      const stockFilter = document.getElementById('stock-filter');
      const ratingFilter = document.getElementById('rating-filter');

      function renderProducts(filtered) {
        productList.innerHTML = "";
        filtered.forEach(p => {
          const div = document.createElement('div');
          div.className = 'product-card';
          div.innerHTML = `
            <img src="${p.imageUrl || ''}" alt="${p.name}" class="product-img" style="width:100%;height:180px;object-fit:cover;">
            <div>${p.name}</div>
          `;
          div.style.cursor = "pointer";
          div.addEventListener('click', () => {
            let userId = null;
            const user = JSON.parse(localStorage.getItem('currentUser'));
            if (user && user.id) userId = user.id;
            openProductModal(p, userId);
          });
          productList.appendChild(div);
        });
      }

      let allProducts = [];
      fetch('http://localhost:5145/api/products')
        .then(res => res.json())
        .then(products => {
          allProducts = products.filter(p => p.category && p.category.toLowerCase() === "motor");
          renderProducts(allProducts);

          function applyFilters() {
            const query = (searchBox.value || "")
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '');

            const minPrice = parseFloat(minPriceInput.value) || 0;
            const maxPrice = parseFloat(maxPriceInput.value) || Infinity;
            const stockValue = stockFilter.value;
            const ratingValue = ratingFilter.value ? parseFloat(ratingFilter.value) : 0;

            const filtered = allProducts.filter(p => {
              const name = (p.name || "")
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');
              if (!name.includes(query)) return false;
              if (p.price < minPrice || p.price > maxPrice) return false;
              if (stockValue === "in" && (!p.stock || p.stock < 1)) return false;
              if (stockValue === "out" && p.stock && p.stock > 0) return false;
              if (ratingValue && (p.rating ?? 0) < ratingValue) return false;
              return true;
            });
            renderProducts(filtered);
          }

          if (searchBox) searchBox.addEventListener('input', applyFilters);
          if (minPriceInput) minPriceInput.addEventListener('input', applyFilters);
          if (maxPriceInput) maxPriceInput.addEventListener('input', applyFilters);
          if (stockFilter) stockFilter.addEventListener('change', applyFilters);
          if (ratingFilter) ratingFilter.addEventListener('change', applyFilters);
        })
        .catch(err => {
          productList.innerHTML = "<p style='color:red'>Nu s-au putut încărca produsele.</p>";
          console.error(err);
        });
    });
});