document.addEventListener("DOMContentLoaded", () => {
  const productList = document.getElementById('product-list');
  const searchBox = document.getElementById('search-box');

  function renderProducts(filtered) {
    productList.innerHTML = "";
    filtered.forEach(p => {
      const div = document.createElement('div');
      div.className = 'product-card';
      div.innerHTML = `
        <div class="img-placeholder" title="${p.description}\nPreț: ${p.price}"></div>
        <div>${p.name}</div>
      `;
      productList.appendChild(div);
    });
  }

  let allProducts = [];
  fetch('http://localhost:5145/api/products')
    .then(res => res.json())
    .then(products => {
      allProducts = products.filter(p => p.category && p.category.toLowerCase() === "motor");
      renderProducts(allProducts);

      if (searchBox) {
        searchBox.addEventListener('input', () => {
          const query = searchBox.value.toLowerCase();
          const filtered = allProducts.filter(p =>
            p.name.toLowerCase().includes(query)
          );
          renderProducts(filtered);
        });
      }
    })
    .catch(err => {
      productList.innerHTML = "<p style='color:red'>Nu s-au putut încărca produsele.</p>";
      console.error(err);
    });
});