let allProducts = [];
let originalProducts = [];
let currentTab = "Synced Products";

function renderData(tab, data) {
  container.innerHTML = "";

  const capitalize = (val) =>
    typeof val === "string"
      ? val.charAt(0).toUpperCase() + val.slice(1)
      : val;

  let headers = [];
  let rows = [];
  let headingText = "";

  // Orders
  if (["Today", "All"].includes(tab)) {
    const orders = data ?? [];
    if (!orders.length) {
      container.innerHTML = `
        <div class="h-full w-full">
          <h2 class="text-xl text-accent text-center font-bold mb-4">${tab}</h2>
          <p class="text-center mx-auto mt-32">No Order ${tab}</p>
        </div>
      `;
      return;
    }
    headingText = `${tab} Orders`;
    headers.push("#", ...Orders.headers.map(capitalize));
    rows = orders.map((order, idx) => [
      idx + 1,
      ...Orders.headers.map((h) => order[h] ?? "")
    ]);
  }

  // Stocks
  if (["Out of Stock", "Going Out of Stock", "All Stock"].includes(tab)) {
    const stocks = data ?? [];
    if (!stocks.length) {
      container.innerHTML = `
        <div class="h-full w-full">
          <h2 class="text-xl text-accent text-center font-bold mb-4">${tab}</h2>
          <p class="text-center mx-auto mt-32">No item ${tab}</p>
        </div>
      `;
      return;
    }
    headingText = `${tab}`;
    headers.push("#", ...Stock.headers.map(capitalize));
    rows = stocks.map((stock, idx) => [
      idx + 1,
      ...Stock.headers.map((h) => stock[h] ?? "")
    ]);
  }

  // Products
  if (["Synced Products", "Non Synced Products"].includes(tab)) {
    const products = data.products ?? [];
    currentTab = tab;

    if (!products.length) {
      container.innerHTML = `
        <div class="h-full w-full">
          <h2 class="text-xl text-accent text-center font-bold mb-4">${tab}</h2>
          <p class="text-center mx-auto mt-32">No ${tab}</p>
        </div>
      `;
      return;
    }

    headingText = `${tab}`;
    headers.push("#", ...Products.headers.map(capitalize));
    rows = products.map((product, idx) => [
      idx + 1,
      ...Products.headers.map((h) => product[h] ?? "")
    ]);

    if (!originalProducts.length) {
      originalProducts = [...products];
    }

    allProducts = [...products];
  }

  // changed prices
  if (["Changed Prices"].includes(tab)) {
    const products = data.products ?? [];
    console.log(products);
    currentTab = tab;

    if (!products.length) {
      container.innerHTML = `
        <div class="h-full w-full">
          <h2 class="text-xl text-accent text-center font-bold mb-4">${tab}</h2>
          <p class="text-center mx-auto mt-32">No ${tab}</p>
        </div>
      `;
      return;
    }

    headingText = `${tab}`;
    headers.push("#", ...PriceChange.headers.map(capitalize));
    rows = products.map((product, idx) => [
      idx + 1,
      ...PriceChange.headers.map((h) => product[h] ?? "")
    ]);

    if (!originalProducts.length) {
      originalProducts = [...products];
    }

    allProducts = [...products];
  }

  // Table rendering
  const heading = document.createElement("h2");
  heading.className = "text-xl font-semibold mb-4 text-center text-accent";
  heading.textContent = headingText;
  container.appendChild(heading);

  const tableWrapper = document.createElement("div");
  tableWrapper.className = "overflow-x-auto";

  const table = document.createElement("table");
  table.className = "table table-xs";

  const thead = document.createElement("thead");
  thead.classList.add("text-accent");
  const headRow = document.createElement("tr");
  headers.forEach((h) => {
    const th = document.createElement("th");
    th.textContent = h;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);

  const tbody = document.createElement("tbody");
  rows.forEach((row) => {
    const tr = document.createElement("tr");

    if (["Synced Products", "Non Synced Products"].includes(tab)) {
      tr.classList.add("cursor-pointer");
      tr.addEventListener("click", () => {
        const modalId = document.getElementById("prod_modal");
        const prod = data.products.find((p) => p.product_id === row[2]);
        showProduct(prod, tab);
        modalId.showModal();
      });
    } else if (["Changed Prices"].includes(tab)) {
      tr.classList.add("cursor-pointer");
      tr.addEventListener("click", () => {
        const prod = data.products.find((p) => p.product_id === row[2]);
        openRemoveModal(prod);
      });
    }

    row.forEach((col) => {
      const td = document.createElement("td");
      td.textContent = col;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  table.appendChild(thead);
  table.appendChild(tbody);
  tableWrapper.appendChild(table);
  container.appendChild(tableWrapper);
}

let displayedProducts = [...allProducts];

const normalize = (str) =>
  (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

searchBar.addEventListener("input", (e) => {
  const query = normalize(e.target.value.trim());

  if (query === "") {
    displayedProducts = [...originalProducts];
  } else {
    displayedProducts = originalProducts.filter(
      (prod) =>
        normalize(prod.category).includes(query) ||
        normalize(prod.subcategory).includes(query)
    );
  }

  renderData(currentTab, { products: displayedProducts });
});
