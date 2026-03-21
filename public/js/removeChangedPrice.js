let currentProduct = null;
function openRemoveModal(prod) {
  currentProduct = prod;
  
  const modal = document.getElementById('my_modal_3');
  const text = document.getElementById('modal-text');
  text.textContent = `Bist du sicher, dass du das Produkt "${prod.name}" entfernen möchtest?`;

  const removeBtn = document.getElementById('confirm-remove-btn');

  removeBtn.replaceWith(removeBtn.cloneNode(true));
  const newRemoveBtn = document.getElementById('confirm-remove-btn');

  newRemoveBtn.addEventListener('click', () => {
    removeProduct(currentProduct.product_id);
    closeModal();
  });

  modal.showModal();
}

function closeModal() {
  const modal = document.getElementById('my_modal_3');
  if (modal.open) modal.close();
}

async function removeProduct(productId) {

 try {
    const resp = await fetch(`/inventory/product/${productId}`, {
     method: 'GET',
     credentials: 'include',
     headers: {
       'Content-Type': 'application/json',
     }
   })
   const jsonRespone = await resp.json();
   if(jsonRespone.status) {
    showToast("Price status updated successfully", "success");
    reRenderData("Changed Prices");
   }
 } catch (error) {
    console.log(error)
 }

}

// Close modal on ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});
