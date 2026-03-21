const showBtn = document.getElementById("show-btn");
const sidebar = document.getElementById("sidebarcomp");
let searchBar = document.getElementById("search-bar");

showBtn.addEventListener("click", () => {
  sidebar.classList.toggle("hidden");
});


document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("container");
  setLoading(true, container)
  const dataMap = {
    "Today": "/order/orders-today",
    "All": "/order/orders-all",
    "Out of Stock": "/inventory/stock-out",
    "Going Out of Stock": "/inventory/stock-going",
    "All Stock": "/inventory/stock-all",
    "Synced Products": "/product/get-synced",
    "Non Synced Products": "/product/get-unsynced",
    "Changed Prices": "/inventory/price-changes",
  };

  const links = document.querySelectorAll("ul.menu li ul li a")
  links.forEach(link => {
    link.addEventListener("click", async (e) => {
      sidebar.classList.add("hidden");
      e.preventDefault();
      container.innerHTML = "";
      setLoading(true, container)

      links.forEach(l => l.classList.remove("text-accent"));
      e.target.classList.add("text-accent");

      let text = e.target.textContent.trim();
      if (text === "Synced Products" || text === "Non Synced Products") {
           searchBar.classList.remove("hidden");
      }
      if (text === "All") {
        const details = e.target.closest("details");
        const summaryText = details?.querySelector("summary")?.textContent || "";
        if (summaryText.includes("Stock")) text = "All Stock";
      }

      const url = dataMap[text];
      if (!url) return;

      try {
        const res = await fetch(url);
        const data = await res.json();
        renderData(text, data);
      } catch (err) {
        console.error("Error fetching data:", err);
        container.innerHTML = `<p class="text-red-500">Error loading data.</p>`;
      } finally {
        setLoading(false, container);
      }
    });
  });

  (async function loadDefault() {
    setLoading(true, container)
    try {
      const res = await fetch(dataMap["Today"]);
      const data = await res.json();
      renderData("Today", data);
    } catch (err) {
      console.error("Error loading default data:", err);
      container.innerHTML = `<p class="text-red-500">Error loading default orders.</p>`;
    } finally {
      setLoading(false, container)
    }
  })();
});
