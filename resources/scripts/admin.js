document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#products-table tbody");
  const modal = document.getElementById("product-modal");
  const closeModal = document.getElementById("close-modal");
  const addBtn = document.getElementById("add-product-btn");
  const form = document.getElementById("product-form");
  const previewImg = document.getElementById("preview-image");

  let editingId = null;

  // Fetch and display products
  async function loadProducts() {
    const res = await fetch("http://localhost:5145/api/products");
    const products = await res.json();
    tableBody.innerHTML = "";
    products.forEach(p => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${p.imageUrl ? `<img src="${p.imageUrl}" style="max-width:60px;"/>` : ""}</td>
        <td>${p.name}</td>
        <td>${p.description}</td>
        <td>${p.category || ""}</td>
        <td>${p.price} lei</td>
        <td>${p.stock}</td>
        <td>
          <button class="edit-btn" data-id="${p.id}">Editează</button>
          <button class="delete-btn" data-id="${p.id}">Șterge</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  // Show modal for add/edit
  function showModal(editProduct = null) {
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
    form.reset();
    previewImg.style.display = "none";
    editingId = null;
    document.getElementById("modal-title").textContent = editProduct ? "Editează Produs" : "Adaugă Produs";
    if (editProduct) {
      editingId = editProduct.id;
      document.getElementById("product-id").value = editProduct.id;
      document.getElementById("product-name").value = editProduct.name;
      document.getElementById("product-category").value = editProduct.category || "";
      document.getElementById("product-desc").value = editProduct.description;
      document.getElementById("product-price").value = editProduct.price;
      document.getElementById("product-stock").value = editProduct.stock;
      if (editProduct.imageUrl) {
        previewImg.src = editProduct.imageUrl;
        previewImg.style.display = "block";
      }
    }
  }

  // Hide modal
  function hideModal() {
    modal.style.display = "none";
    document.body.style.overflow = "";
  }

  closeModal.onclick = hideModal;
  window.onclick = e => { if (e.target === modal) hideModal(); };

  // Add product button
  addBtn.onclick = () => showModal();

  // Edit button
  tableBody.addEventListener("click", async e => {
    if (e.target.classList.contains("edit-btn")) {
      const id = e.target.dataset.id;
      const res = await fetch(`http://localhost:5145/api/products/${id}`);
      const product = await res.json();
      showModal(product);
    }
    if (e.target.classList.contains("delete-btn")) {
      const id = e.target.dataset.id;
      if (confirm("Sigur ștergi acest produs?")) {
        await fetch(`http://localhost:5145/api/products/${id}`, { method: "DELETE" });
        loadProducts();
      }
    }
  });

  // Image preview
  document.getElementById("product-image").onchange = function() {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        previewImg.src = e.target.result;
        previewImg.style.display = "block";
      };
      reader.readAsDataURL(file);
    }
  };

  // Add/Edit submit
  form.onsubmit = async e => {
    e.preventDefault();
    const id = document.getElementById("product-id").value;
    const name = document.getElementById("product-name").value;
    const category = document.getElementById("product-category").value;
    const description = document.getElementById("product-desc").value;
    const price = parseFloat(document.getElementById("product-price").value);
    const stock = parseInt(document.getElementById("product-stock").value, 10);
    const imageInput = document.getElementById("product-image");
    let imageUrl = previewImg.src && previewImg.style.display !== "none" ? previewImg.src : "";

    const product = { name, category, description, price, stock, imageUrl };

    if (id) {
      // Edit
      await fetch(`http://localhost:5145/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product)
      });
    } else {
      // Add
      await fetch("http://localhost:5145/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product)
      });
    }
    hideModal();
    loadProducts();
  };

  loadProducts();
});