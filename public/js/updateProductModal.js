function showProduct(prod, tab) {
  let promoField = '';
  if (prod.promotional_price) {
    promoField = `
        <fieldset class="fieldset">
        <legend class="fieldset-legend text-primary p-0">Promotional Price</legend>
        <input
          type="number"
          id="promotional_price"
          class="input-autofill input w-full border rounded py-2 px-2 bg-white text-black border-accent focus:border-2 focus:ring-primary"
          value="${prod?.promotional_price * 1.2}"
          name="promotional_price"
          required
        />
      </fieldset>`;
  }
  const card = document.getElementById("card");
  card.innerHTML = `
    <h3 class="text-center pb-4 lg:text-2xl md:text-xl text-lg md:mt-0.5 text-primary lg:mt-1">
      Update Product
    </h3>
    <form id="updateProductForm" class="dialog flex flex-col gap-1 md:gap-2 lg:gap-3">
      <fieldset class="fieldset">
        <legend class="fieldset-legend text-primary p-0">Name</legend>
        <input
          type="text"
          id="name"
          class="input-autofill input w-full border rounded py-2 px-2 bg-white text-black border-accent focus:border-2 focus:ring-primary"
          value="${prod.name}"
          name="name"
          required
        />
      </fieldset>

      <fieldset class="fieldset">
        <legend class="fieldset-legend text-primary p-0">Short Description</legend>
        <textarea
          id="description_de"
          class="input-autofill text-wrap input w-full border rounded py-2 px-2 bg-white text-black border-accent focus:border-2 focus:ring-primary resize-none overflow-hidden"
          name="description_de"
          style="min-height: 4.5rem;"
          required
        >${prod.description_de}</textarea>
      </fieldset>

      <fieldset class="fieldset">
        <legend class="fieldset-legend text-primary p-0">Price</legend>
        <input
          type="number"
          id="price"
          class="input-autofill input w-full border rounded py-2 px-2 bg-white text-black border-accent focus:border-2 focus:ring-primary"
          value="${prod.price * 1.2}"
          name="price"
          required
        />
      </fieldset>

      <fieldset class="fieldset">
        <legend class="fieldset-legend text-primary p-0">Tags</legend>
        <input
          type="text"
          id="tags"
          class="input-autofill input w-full border rounded py-2 px-2 bg-white text-black border-accent focus:border-2 focus:ring-primary"
          placeholder="Comma separated tags like tag1, tag2"
          name="tags"
          required
        />
      </fieldset>

    <fieldset class="fieldset">
      <legend class="fieldset-legend text-primary p-0">Collection</legend>
      <select
        id="collection"
        name="collection"
        class="input-autofill input w-full border rounded py-2 px-2 bg-white text-black border-accent focus:border-2 focus:ring-primary"
        required
    >
        <option value="">-- Select Collection --</option>
        <option value="Autos aufladen">Autos aufladen</option>
        <option value="Carports">Carports</option>
        <option value="GAK / Überspannungsableiter">GAK / Überspannungsableiter</option>
        <option value="Hybrid-Wechselrichter">Hybrid-Wechselrichter</option>
        <option value="Installationsüberwachung">Installationsüberwachung</option>
        <option value="Kabel">Kabel</option>
        <option value="Klimaanlagen">Klimaanlagen</option>
        <option value="Komplettanlage">Komplettanlage</option>
        <option value="Modulhäuser">Modulhäuser</option>
        <option value="Montage und Inbetriebnahme">Montage und Inbetriebnahme</option>
        <option value="Netzumschaltbox">Netzumschaltbox</option>
        <option value="Optimierer">Optimierer</option>
        <option value="Paneele">Paneele</option>
        <option value="Smartmeter">Smartmeter</option>
        <option value="Speicher">Speicher</option>
        <option value="Stecker">Stecker</option>
        <option value="Unterkonstruktion">Unterkonstruktion</option>
        <option value="Wärmepumpe">Wärmepumpe</option>
        <option value="Werkzeug & Stecker">Werkzeug & Stecker</option>
        <option value="Zubehör">Zubehör</option>
      </select>
    </fieldset>


      ${ promoField }

      <div class="mt-2">
        <span class="block w-full rounded-md shadow-sm">
          <button
            type="submit"
            class="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md opacity-90 hover:opacity-100 bg-primary text-primary-content cursor-pointer"
            id="submitBtn"
          >
            Upload
          </button>
        </span>
      </div>
    </form>
  `;

  const form = document.getElementById("updateProductForm");
  const name = document.getElementById("name");
  const description_de = document.getElementById("description_de");
  const price = document.getElementById("price");
  const promotional_price = document.getElementById("promotional_price");
  const btn = document.getElementById("submitBtn");
  const closeBtn = document.getElementById("close-btn");
  const tags = document.getElementById("tags");
  const collection = document.getElementById("collection");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      btn.innerText = "";
      btn.innerHTML = `<span class="loading loading-spinner loading-sm"></span>`;

      const response = await fetch("/product/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: prod.product_id,
          name: name.value.trim(),
          description_de: description_de.value.trim(),
          price: Number(price.value),
          promotional_price: promotional_price ? Number(promotional_price.value) : null,
          tags: tags.value.trim(),
          collection: collection.value,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.message || "Error updating product", "error");
        return;
      }
      showToast("Product uploaded successfully");
      closeBtn.click();
      reRenderData(tab)
    } catch (err) {
      showToast("Something went wrong", "error");
      console.error(err);
    } finally {
      btn.innerText = "Upload";
    }
  });
}

function openProductModal(product) {
  const modal = document.getElementById("prod-modal");
  const titleEl = document.getElementById("modal-title");
  const contentEl = document.getElementById("modal-content");

  titleEl.textContent = product.name;
  let promEl = '';
  if (product.promotional_price) {
      promEl = `<strong>Promotional Price:</strong> ${product.promotional_price}`;
  }
  contentEl.innerHTML = `
    <strong>Description:</strong> ${product.description_de}<br>
    <strong>Price:</strong> ${product.price}<br>
    ${promEl}
  `;

  modal.showModal();
}