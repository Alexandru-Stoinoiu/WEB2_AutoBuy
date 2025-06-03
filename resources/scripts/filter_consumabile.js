let currentProductId = null;
let currentUserId = null;

document.addEventListener("DOMContentLoaded", () => {
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
        <div class="img-placeholder"></div>
        <div>${p.name}</div>
      `;
      div.style.cursor = "pointer";
      div.addEventListener('click', () => openProductModal(p));
      productList.appendChild(div);
    });
  }

  const modal = document.getElementById('product-modal');
  const modalContent = document.getElementById('product-modal-content');
  const modalClose = document.getElementById('product-modal-close');
  const modalImg = document.getElementById('modal-img');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalPrice = document.getElementById('modal-price');
  const modalAddCart = document.getElementById('modal-add-cart');
  const modalStock = document.getElementById('modal-stock');

  function openProductModal(product) {
    currentProductId = product.id;
    // get userId from localStorage
    currentUserId = (() => {
      const user = JSON.parse(localStorage.getItem('currentUser'));
      return user && user.id ? user.id : null;
    })();

    modalImg.src = product.imageUrl || "https://via.placeholder.com/180x180?text=Imagine";
    modalTitle.textContent = product.name;
    modalDesc.textContent = product.description || "Fără descriere.";

    if (product.stock && product.stock > 0) {
      modalStock.textContent = `În stoc (${product.stock})`;
      modalStock.style.color = "#388e3c";
      modalAddCart.disabled = false;
      modalAddCart.style.background = "#1a73e8";
      modalAddCart.style.cursor = "pointer";
      modalAddCart.textContent = "Adaugă în coș";
    } else {
      modalStock.textContent = "Nu sunt produse în stoc";
      modalStock.style.color = "#d32f2f";
      modalAddCart.disabled = true;
      modalAddCart.style.background = "#bdbdbd";
      modalAddCart.style.cursor = "not-allowed";
      modalAddCart.textContent = "Stoc epuizat";
    }

    modalPrice.textContent = "Preț: " + product.price + " lei";
    modal.style.display = "flex";

    modalAddCart.onclick = () => {
      if (product.stock && product.stock > 0) {
        let cart = JSON.parse(localStorage.getItem('cart') || "[]");
        cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
        localStorage.setItem('cart', JSON.stringify(cart));
        modal.style.display = "none";
      }
    };

    fetchUserRating(currentProductId, currentUserId);
    fetchMedianRating(currentProductId);
  }

  modalClose.onclick = () => modal.style.display = "none";
  modal.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; }

  let allProducts = [];
  fetch('http://localhost:5145/api/products')
    .then(res => res.json())
    .then(products => {
      allProducts = products.filter(p => p.category && p.category.toLowerCase() === "consumabile");
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

function renderStars(userRating) {
  const starContainer = document.getElementById('star-rating');
  starContainer.innerHTML = '';
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement('span');
    star.className = 'rating-star' + (i <= userRating ? ' selected' : '');
    star.textContent = '★';
    star.dataset.value = i;
    star.onclick = () => setUserRating(i, currentProductId, currentUserId);
    starContainer.appendChild(star);
  }
}

const API_BASE = "http://localhost:5145/api/ProductRatings";

function setUserRating(rating, productId, userId) {
  fetch(`${API_BASE}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, userId, rating })
  }).then(() => {
    renderStars(rating, productId, userId);
    fetchMedianRating(productId);
  });
}

function fetchUserRating(productId, userId) {
  fetch(`${API_BASE}/${productId}/user/${userId}`)
    .then(res => {
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    })
    .then(rating => {
      renderStars(rating, productId, userId);
    })
    .catch(err => console.error(err));
}

function fetchMedianRating(productId) {
  fetch(`${API_BASE}/${productId}/median`)
    .then(res => {
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    })
    .then(median => {
      document.getElementById('median-rating').textContent = `Medie: ${median}`;
    })
    .catch(err => console.error(err));
}

renderStars(0);