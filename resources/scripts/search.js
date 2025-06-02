document.addEventListener("DOMContentLoaded", () => {
  const searchBox = document.getElementById('search-box');
  const productList = document.getElementById('product-list');

  function removeDiacritics(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function renderProducts(filtered) {
    productList.innerHTML = "";
    filtered.forEach(p => {
      const div = document.createElement('div');
      div.className = 'product-card';

      const imgPlaceholder = document.createElement('div');
      imgPlaceholder.className = 'img-placeholder';
      imgPlaceholder.title = `${p.description}\nPreț: ${p.price}`;

      const info = document.createElement('div');
      info.innerText = p.name;

      div.appendChild(imgPlaceholder);
      div.appendChild(info);
      productList.appendChild(div);
    });
  }

 
  let allProducts = [];
  fetch('http://localhost:5145/api/products')
    .then(res => res.json())
    .then(products => {
      allProducts = products;
      renderProducts(allProducts.slice(0, 5));

      if (searchBox) {
        searchBox.addEventListener('input', () => {
          const query = removeDiacritics(searchBox.value.toLowerCase());
          const filtered = allProducts.filter(p =>
            removeDiacritics(p.name.toLowerCase()).includes(query)
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