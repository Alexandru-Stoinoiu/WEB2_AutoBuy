import {
  setupAdminModalEvents,
  showAdminModal,
  hideAdminModal,
  showAdminLoadingModal,
  showAdminDoneModal,
  setupAdminLoadingModalEvents
} from './modals/admin-modal.js';
import { loadSidebar } from '../../resources/scripts/partials/sidebar.js';
window.addEventListener('DOMContentLoaded', loadSidebar);

document.addEventListener("DOMContentLoaded", () => {
  fetch('../modals/admin-modal.html')
    .then(res => res.text())
    .then(html => {
      document.body.insertAdjacentHTML('beforeend', html);
      setupAdminModalEvents();
      setupAdminLoadingModalEvents();

      const tableBody = document.querySelector("#products-table tbody");
      const addBtn = document.getElementById("add-product-btn");
      const form = document.getElementById("product-form");
      const previewImg = document.getElementById("preview-image");

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
    <button class="edit-btn" data-id="${p.id}" title="Editează">
      <svg class="icon-pencil" viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14.7 3.3a1 1 0 0 1 1.4 1.4l-9.2 9.2-2.1.7.7-2.1 9.2-9.2z"/>
        <path d="M13.3 5.7l1.4 1.4"/>
      </svg>
    </button>
    <button class="delete-btn" data-id="${p.id}" title="Șterge">
      <svg class="icon-trash" viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="5" y="7" width="10" height="8" rx="1"/>
        <path d="M3 7h14M8 7V5a2 2 0 0 1 4 0v2"/>
      </svg>
    </button>
  </td>
`;
          tableBody.appendChild(tr);
        });
      }

      addBtn.onclick = () => showAdminModal();

      tableBody.addEventListener("click", async e => {
        if (e.target.closest(".edit-btn")) {
          const btn = e.target.closest(".edit-btn");
          const id = btn.dataset.id;
          showAdminLoadingModal("Se încarcă produsul...", "Vă rugăm așteptați.");
          try {
            const res = await fetch(`http://localhost:5145/api/products/${id}`);
            const product = await res.json();
            hideAdminModal();
            showAdminModal(product);
          } catch (err) {
            showAdminDoneModal("Eroare la încărcarea produsului.");
          }
        }
        if (e.target.closest(".delete-btn")) {
          const btn = e.target.closest(".delete-btn");
          const id = btn.dataset.id;
          if (confirm("Sigur ștergi acest produs?")) {
            showAdminLoadingModal("Se șterge produsul...", "Vă rugăm așteptați până când produsul este șters.");
            try {
              await fetch(`http://localhost:5145/api/products/${id}`, { method: "DELETE" });
              showAdminDoneModal("Produsul a fost șters cu succes!");
              loadProducts();
            } catch (err) {
              showAdminDoneModal("A apărut o eroare la ștergere.");
            }
          }
        }
      });

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

        showAdminLoadingModal(
          id ? "Se salvează modificările..." : "Se adaugă produsul...",
          "Vă rugăm așteptați până când operațiunea este finalizată."
        );

        try {
          if (id) {
            await fetch(`http://localhost:5145/api/products/${id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(product)
            });
          } else {
            await fetch("http://localhost:5145/api/products", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(product)
            });
          }
          hideAdminModal();
          showAdminDoneModal("Operațiunea a fost finalizată cu succes!");
          loadProducts();
        } catch (err) {
          showAdminDoneModal("A apărut o eroare la salvare.");
        }
      };

      loadProducts();
    });
});