const navbar = `
<div class="navbar-start">
    <a href="/" class="text-accent font-bold text-sm md:text-md lg:text-lg xl:text-xl 2xl:text-2xl">Baristro</a>
  </div>
  <div id="search-bar" class="hidden navbar-center w-52 md:w-60 lg:w-96 xl:w-96 2xl:w-1/3 relative">
    <input id="searchBar" type="text" placeholder="Search categories and subcategories here!" class="input text-accent input-accent w-full" autocomplete="off" />
    <ul id="suggestions"></ul>
  </div>
  <div id="logout-container" class="navbar-end flex items-center gap-2">
    <a href="/menu/page" class="btn text-xs btn-xs lg:btn-sm btn-ghost text-accent border border-accent hover:bg-accent hover:text-black">Manage</a>
    <a href="/menu/addons/page" class="btn text-xs btn-xs lg:btn-sm btn-ghost text-accent border border-accent hover:bg-accent hover:text-black">Addons</a>
    <button id="btn-store-snooze" class="btn text-xs btn-xs lg:btn-sm btn-ghost text-accent border border-accent hover:bg-accent hover:text-black" disabled>Snooze Store</button>
    <button id="btn-store-busy" class="btn text-xs btn-xs lg:btn-sm btn-ghost text-accent border border-accent hover:bg-accent hover:text-black" disabled>Set Busy</button>
    <button id="btn-logout" class="btn text-xs btn-xs lg:btn-sm text-accent bg-base-300 border border-accent hover:bg-accent hover:border-black hover:border-2 hover:text-black">Logout</button>
  </div>
`;

const wrapper = document.createElement("div");
wrapper.classList.add("navbar", "shadow-sm", "bg-base-300", "text-primary-content");
wrapper.innerHTML = navbar;
document.body.prepend(wrapper);

(function () {
  const btn = wrapper.querySelector("#btn-store-snooze");

  function render(isSnoozed) {
    btn.textContent = isSnoozed ? "Unsnooze Store" : "Snooze Store";
    btn.dataset.snoozed = String(isSnoozed);
    btn.disabled = false;
  }

  async function loadStatus() {
    try {
      const res = await fetch("/snooze/store", { credentials: "include" });
      const data = await res.json();
      render(!!data.isSnoozed);
    } catch (e) {
      btn.textContent = "Snooze Store";
    }
  }

  btn.addEventListener("click", async () => {
    btn.disabled = true;
    try {
      const res = await fetch("/snooze/store", { method: "PATCH", credentials: "include" });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      render(data.isSnoozed);
      if (typeof showToast === "function") {
        showToast(data.isSnoozed ? "Store snoozed" : "Store unsnoozed", data.isSnoozed ? "warning" : "success");
      }
    } catch (e) {
      btn.disabled = false;
      if (typeof showToast === "function") showToast("Failed to update store status", "error");
    }
  });

  loadStatus();
})();

(function () {
  const btn = wrapper.querySelector("#btn-store-busy");

  function render(isBusy) {
    btn.textContent = isBusy ? "Set Available" : "Set Busy";
    btn.dataset.busy = String(isBusy);
    btn.disabled = false;
  }

  async function loadStatus() {
    try {
      const res = await fetch("/snooze/store/busy", { credentials: "include" });
      const data = await res.json();
      render(!!data.isBusy);
    } catch (e) {
      btn.textContent = "Set Busy";
    }
  }

  btn.addEventListener("click", async () => {
    btn.disabled = true;
    try {
      const res = await fetch("/snooze/store/busy", { method: "PATCH", credentials: "include" });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      render(data.isBusy);
      if (typeof showToast === "function") {
        showToast(data.isBusy ? "Store set to busy" : "Store set to available", data.isBusy ? "warning" : "success");
      }
    } catch (e) {
      btn.disabled = false;
      if (typeof showToast === "function") showToast("Failed to update busy status", "error");
    }
  });

  loadStatus();
})();