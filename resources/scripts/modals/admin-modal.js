export function setupAdminModalEvents() {
  const modal = document.getElementById("product-modal");
  const closeModal = document.getElementById("close-modal");
  if (closeModal) closeModal.onclick = hideAdminModal;
  window.onclick = e => { if (e.target === modal) hideAdminModal(); };
}

export function showAdminModal(editProduct = null) {
  const modal = document.getElementById("product-modal");
  const form = document.getElementById("product-form");
  const previewImg = document.getElementById("preview-image");
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
  form.reset();
  previewImg.style.display = "none";
  document.getElementById("modal-title").textContent = editProduct ? "Editează Produs" : "Adaugă Produs";
  if (editProduct) {
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

export function hideAdminModal() {
  const modal = document.getElementById("product-modal");
  modal.style.display = "none";
  document.body.style.overflow = "";
}

export function setupAdminLoadingModalEvents() {
  const okBtn = document.getElementById("admin-loading-ok");
  const closeBtn = document.getElementById("admin-loading-close");
  const loadingModal = document.getElementById("admin-loading-modal");
  if (okBtn) okBtn.onclick = hideAdminLoadingModal;
  if (closeBtn) closeBtn.onclick = hideAdminLoadingModal;
  if (loadingModal) {
    loadingModal.onclick = e => {
      if (e.target === loadingModal) hideAdminLoadingModal();
    };
  }
}

export function showAdminLoadingModal(title = "Se procesează...", message = "Vă rugăm așteptați. Operațiunea este în curs.") {
  const modal = document.getElementById("admin-loading-modal");
  document.getElementById("admin-loading-title").textContent = title;
  document.getElementById("admin-loading-message").textContent = message;
  document.getElementById("admin-loading-spinner").style.display = "block";
  document.getElementById("admin-loading-ok").style.display = "none";
  document.getElementById("admin-loading-close").style.display = "none";
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

export function showAdminDoneModal(message = "Operațiunea a fost finalizată cu succes!") {
  const modal = document.getElementById("admin-loading-modal");
  document.getElementById("admin-loading-title").textContent = "Gata!";
  document.getElementById("admin-loading-message").textContent = message;
  document.getElementById("admin-loading-spinner").style.display = "none";
  document.getElementById("admin-loading-ok").style.display = "inline-block";
  document.getElementById("admin-loading-close").style.display = "inline-block";
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

export function hideAdminLoadingModal() {
  const modal = document.getElementById("admin-loading-modal");
  modal.style.display = "none";
  document.body.style.overflow = "";
}