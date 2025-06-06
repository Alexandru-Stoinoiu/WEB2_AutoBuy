export function openProductModal(product, userId = null) {
  const modal = document.getElementById('product-modal');
  const modalImg = document.getElementById('modal-img');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalPrice = document.getElementById('modal-price');
  const modalStock = document.getElementById('modal-stock');
  const modalAddCart = document.getElementById('modal-add-cart');

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
      cart.push({ id: product.id, name: product.name, price: product.price, qty: 1, imageUrl: product.imageUrl });
      localStorage.setItem('cart', JSON.stringify(cart));
      modal.style.display = "none";
    }
  };

  fetchUserRating(product.id, userId);
  fetchMedianRating(product.id);
}

export function closeProductModal() {
  document.getElementById('product-modal').style.display = "none";
}

export function setupModalEvents() {
  const modal = document.getElementById('product-modal');
  const modalClose = document.getElementById('product-modal-close');
  modalClose.onclick = closeProductModal;
  modal.onclick = (e) => { if (e.target === modal) closeProductModal(); };

  const cartModal = document.getElementById('cart-modal');
  const cartModalClose = document.getElementById('cart-modal-close');
  if (cartModal && cartModalClose) {
    cartModalClose.onclick = () => { cartModal.style.display = "none"; };
    cartModal.onclick = (e) => { if (e.target === cartModal) cartModal.style.display = "none"; };
  }
}

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

function fetchUserRating(productId, userId) {
  if (!userId) {
    renderStars(0, productId, userId);
    return;
  }
  fetch(`${API_BASE}/${productId}/user/${userId}`)
    .then(res => {
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    })
    .then(rating => {
      renderStars(rating, productId, userId);
    })
    .catch(() => renderStars(0, productId, userId));
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
    .catch(() => {
      document.getElementById('median-rating').textContent = `Medie: -`;
    });
}