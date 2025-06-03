document.addEventListener("DOMContentLoaded", () => {
  const productList = document.getElementById('product-list');

function renderProducts(products) {
  productList.innerHTML = "";
  products.forEach(p => {
    const div = document.createElement('div');
    div.className = 'product-card';
    div.innerHTML = `
      <div class="img-placeholder"></div>
      <div>${p.name}</div>
    `;
    div.addEventListener('click', () => openProductModal(p));
    productList.appendChild(div);
  });
}

  const modal = document.getElementById('product-modal');
  const modalClose = document.getElementById('product-modal-close');
  const modalImg = document.getElementById('modal-img');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalPrice = document.getElementById('modal-price');
  const modalStock = document.getElementById('modal-stock');
  const modalAddCart = document.getElementById('modal-add-cart');

  let currentProductId = null;

function openProductModal(product) {
  currentProductId = product.id;
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
  let userId = (() => {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  return user && user.id ? user.id : null;
 })();

  fetchUserRating(currentProductId, userId);
  fetchMedianRating(currentProductId);
}

  modalClose.onclick = () => modal.style.display = "none";
  modal.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };

  fetch('http://localhost:5145/api/products')
    .then(res => res.json())
    .then(products => {
        const topRated = products
            .slice() // copy array to avoid mutating original
            .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || a.name.localeCompare(b.name))
            .slice(0, 5);
      renderProducts(topRated);
    })
    .catch(err => {
      productList.innerHTML = "<p style='color:red'>Nu s-au putut încărca produsele.</p>";
      console.error(err);
    });
});

function renderStars(userRating, productId, userId) {
  const starContainer = document.getElementById('star-rating');
  starContainer.innerHTML = '';
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement('span');
    star.className = 'rating-star' + (i <= userRating ? ' selected' : '');
    star.textContent = '★';
    star.dataset.value = i;
    star.onclick = () => setUserRating(i, productId, userId);
    starContainer.appendChild(star);
  }
}

const API_BASE = "http://localhost:5145/api/ProductRatings";

function setUserRating(rating, productId, userId) {
  fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, userId, rating })
  }).then(() => {
    renderStars(rating, productId, userId);
    fetchMedianRating(productId);
  });
}

function fetchUserRating(currentProductId, currentUserId) {
  fetch(`${API_BASE}/${currentProductId}/user/${currentUserId}`)
    .then(res => {
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    })
    .then(rating => {
      renderStars(rating, currentProductId, currentUserId);
    })
    .catch(err => console.error(err));
}

function fetchMedianRating(currentProductId) {
  fetch(`${API_BASE}/${currentProductId}/median`)
    .then(res => {
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    })
    .then(median => {
      document.getElementById('median-rating').textContent = `Medie: ${median}`;
    })
    .catch(err => console.error(err));
}

// When opening the modal for a product:
// function openProductModal(product) {
//   currentProductId = product.id;
//   // ... set modal fields ...
//   fetchUserRating();
//   fetchMedianRating();
// }
renderStars(0);