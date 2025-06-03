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

function openProductModal(product) {
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
}

  modalClose.onclick = () => modal.style.display = "none";
  modal.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };

  fetch('http://localhost:5145/api/products')
    .then(res => res.json())
    .then(products => {
      renderProducts(products.slice(0, 5));
    })
    .catch(err => {
      productList.innerHTML = "<p style='color:red'>Nu s-au putut încărca produsele.</p>";
      console.error(err);
    });
});