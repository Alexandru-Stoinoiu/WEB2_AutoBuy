
document.addEventListener("DOMContentLoaded", () => {
  const searchBox = document.getElementById('search-box');
  const productList = document.getElementById('product-list');

  function renderProducts(filtered) {
  productList.innerHTML = "";
  filtered.forEach(p => {
    const div = document.createElement('div');
    div.className = 'product-card';

    // Placeholder image container
    const imgPlaceholder = document.createElement('div');
    imgPlaceholder.className = 'img-placeholder';
    imgPlaceholder.title = `${p.description}\nPreț: ${p.price}`;

    // Optionally, show the name and category below
    const info = document.createElement('div');
    info.innerText = p.name + ' (' + p.category + ')';

    div.appendChild(imgPlaceholder);
    div.appendChild(info);
    productList.appendChild(div);
  });
}

  if (searchBox) {
    searchBox.addEventListener('input', () => {
      const query = searchBox.value.toLowerCase();
      const filtered = products.filter(p => p.name.toLowerCase().includes(query));
      renderProducts(filtered);
    });

    renderProducts(products);
  }
});
