document.getElementById('open-cart-btn').onclick = function() {
  const cartModal = document.getElementById('cart-modal');
  const cartList = document.getElementById('cart-list');
  const cartTotal = document.getElementById('cart-total');
  const buyBtn = document.getElementById('cart-buy-btn');
  let cart = JSON.parse(localStorage.getItem('cart') || "[]");

  // Group cart items by id to support quantity
  const grouped = {};
  cart.forEach(item => {
    if (!item.id) return; // skip items without id
    if (!grouped[item.id]) {
      grouped[item.id] = { ...item, quantity: 1 };
    } else {
      grouped[item.id].quantity += 1;
    }
  });
  const groupedCart = Object.values(grouped);

  cartList.innerHTML = "";
  if (groupedCart.length === 0) {
    cartList.innerHTML = "<li>Cart is empty.</li>";
    cartTotal.textContent = "";
    if (buyBtn) buyBtn.style.display = "none";
  } else {
    groupedCart.forEach((item, idx) => {
      const li = document.createElement('li');
      li.className = "cart-item";
      li.innerHTML = `
        <div class="cart-item-img">
          ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}">` : ""}
        </div>
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${item.price} lei x ${item.quantity}</div>
        <button class="cart-item-remove" title="Șterge" data-index="${item.id}">&times;</button>
      `;
      cartList.appendChild(li);
    });

    cartList.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.onclick = function(e) {
        e.stopPropagation();
        const id = this.getAttribute('data-index');
        // Remove all items with this id from cart
        cart = cart.filter(item => item.id != id);
        localStorage.setItem('cart', JSON.stringify(cart));
        document.getElementById('open-cart-btn').onclick(); // re-render
      };
    });

    // Calculate and display total (extract number from price string)
    const total = groupedCart.reduce((sum, item) => {
      const priceNum = parseFloat(item.price.toString().replace(/[^\d.]/g, '')) || 0;
      return sum + priceNum * item.quantity;
    }, 0);
    cartTotal.textContent = `Total: ${total.toFixed(2)} lei`;

    if (buyBtn) {
  buyBtn.style.display = "block";
  buyBtn.onclick = async function() {
    try {
      const response = await fetch('http://localhost:5145/api/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart: groupedCart })
      });
      const result = await response.json();
      console.log('Buy API response:', result);
      if (!response.ok) {
        alert(result.error || "A apărut o eroare la cumpărare!");
        return;
      }
      localStorage.setItem('cart', "[]");
      window.location.href = "https://www.youtube.com/watch?v=o0ZpesMYF6A&ab_channel=HandyMan";
    } catch (err) {
      alert("A apărut o eroare la cumpărare!");
      console.error(err);
    }
  };
}
  }
  cartModal.style.display = "flex";
};

document.getElementById('cart-modal-close').onclick = function() {
  document.getElementById('cart-modal').style.display = "none";
};

document.getElementById('cart-modal').onclick = function(e) {
  if (e.target === this) this.style.display = "none";
};