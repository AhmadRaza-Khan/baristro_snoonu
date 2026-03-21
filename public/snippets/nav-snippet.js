const navbar = `
<div class="navbar-start">
    <a class="text-accent font-bold text-sm md:text-md lg:text-lg xl:text-xl 2xl:text-2xl">Voltaik</a>
  </div>
  <div id="search-bar" class="hidden navbar-center w-52 md:w-60 lg:w-96 xl:w-96 2xl:w-1/3 relative">
    <input id="searchBar" type="text" placeholder="Search categories and subcategories here!" class="input text-accent input-accent w-full" autocomplete="off" />
    <ul id="suggestions"></ul>
  </div>
  <div id="logout-container" class="navbar-end">
    <button id="btn-logout" class="btn text-xs btn-xs lg:btn-sm text-accent bg-base-300 border border-accent hover:bg-accent hover:border-black hover:border-2 hover:text-black">Logout</button>
  </div>
`;

const wrapper = document.createElement("div");
wrapper.classList.add("navbar", "shadow-sm", "bg-base-300", "text-primary-content");
wrapper.innerHTML = navbar;
document.body.prepend(wrapper);

const products = [
  { category: "Photovoltaikmodule", subcategory: "Polykristallin" },
  { category: "Photovoltaikmodule", subcategory: "Monokristallin" },
  { category: "Montagestrukturen", subcategory: "Hauptschienen" },
  { category: "Montagestrukturen", subcategory: "Griffe" },
  { category: "Montagestrukturen", subcategory: "Bolzen, Schrauben, Muttern" },
  { category: "Montagestrukturen", subcategory: "Anschlüsse" },
  { category: "Montagestrukturen", subcategory: "Klemmen" },
  { category: "Montagestrukturen", subcategory: "Freistehende Stützen" },
  { category: "Montagestrukturen", subcategory: "Dreiecke" },
  { category: "Montagestrukturen", subcategory: "Zubehör" },
  { category: "Montagestrukturen", subcategory: "Kabelbinder" },
  { category: "Montagestrukturen", subcategory: "Flachdach-Bausätze" },
  { category: "Montagestrukturen", subcategory: "Einzelne Stützelemente" },
  { category: "Montagestrukturen", subcategory: "Tragschienen" },
  { category: "Montagestrukturen", subcategory: "Sätze" },
  { category: "Wechselrichter", subcategory: "Hybrid" },
  { category: "Wechselrichter", subcategory: "Netzgebunden" },
  { category: "Wechselrichter", subcategory: "Wechselrichter-Zubehör" },
  { category: "Wechselrichter", subcategory: "Garantieverlängerungen" },
  { category: "Wechselrichter", subcategory: "NACHRÜSTUNG" },
  { category: "Wechselrichter", subcategory: "Hybrid-Niederspannung" },
  { category: "Solarkollektoren", subcategory: "Pumpengruppen" },
  { category: "Solarkollektoren", subcategory: "Solarregler" },
  { category: "Solarkollektoren", subcategory: "Behälter" },
  { category: "Solarkollektoren", subcategory: "Zubehör" },
  { category: "Solarkollektoren", subcategory: "Membrangefäße" },
  { category: "Solarkollektoren", subcategory: "Glykol" },
  { category: "Solarkollektoren", subcategory: "Solarkabel" },
  { category: "Solarkollektoren", subcategory: "Vakuum" },
  { category: "Solarkollektoren", subcategory: "Wohnung" },
  { category: "Solarkollektoren", subcategory: "Montagesätze" },
  { category: "Solarkollektoren", subcategory: "Werkzeuge" },
  { category: "Solarkollektoren", subcategory: "Montagestrukturen" },
  { category: "Leistungsoptimierer", subcategory: "SolarEdge" },
  { category: "Leistungsoptimierer", subcategory: "Tigo" },
  { category: "Leistungsoptimierer", subcategory: "Huawei" },
  { category: "Anschlussverteiler", subcategory: "DC-Überspannungsableiter" },
  { category: "Anschlussverteiler", subcategory: "AC-Überspannungsableiter" },
  { category: "Anschlussverteiler", subcategory: "Gehäuse" },
  { category: "Anschlussverteiler", subcategory: "DC-Leistungsschalter" },
  { category: "Anschlussverteiler", subcategory: "AC-Leistungsschalter" },
  { category: "Anschlussverteiler", subcategory: "Drosseln" },
  { category: "Anschlussverteiler", subcategory: "Ausgleichsschienen" },
  { category: "Anschlussverteiler", subcategory: "Signalleuchten" },
  { category: "Anschlussverteiler", subcategory: "AC-Anschlussschalttafeln" },
  { category: "Anschlussverteiler", subcategory: "DC-Anschlussschalttafeln" },
  { category: "Anschlussverteiler", subcategory: "DCAC-Anschlussplatinen" },
  { category: "Anschlussverteiler", subcategory: "Auslöser" },
  { category: "Anschlussverteiler", subcategory: "Transformatoren" },
  { category: "Anschlussverteiler", subcategory: "Sicherungssockel" },
  { category: "Anschlussverteiler", subcategory: "Sicherungseinsätze" },
  { category: "Anschlussverteiler", subcategory: "Brandschutzelemente" },
  { category: "Anschlussverteiler", subcategory: "AC-Differenzial-Leistungsschalter" },
  { category: "Wechselrichter-Zubehör", subcategory: "SolarEdge" },
  { category: "Wechselrichter-Zubehör", subcategory: "Huawei" },
  { category: "Wechselrichter-Zubehör", subcategory: "Goodwe" },
  { category: "Wechselrichter-Zubehör", subcategory: "Fronius" },
  { category: "Wechselrichter-Zubehör", subcategory: "SMA" },
  { category: "Wechselrichter-Zubehör", subcategory: "Tigo" },
  { category: "Wechselrichter-Zubehör", subcategory: "FoxESS" },
  { category: "Wechselrichter-Zubehör", subcategory: "Sonnenplanet" },
];

const categoriesAndSubs = [
  ...new Set(products.flatMap(p => [p.category, p.subcategory]))
];

const suggestions = document.getElementById("suggestions");
suggestions.classList.add("absolute", "bg-base-100", "text-primary", "text-xs", "md:text-sm", "lg:text-md", "xl:text-md", "2xl:text-lg", "rounded", "mt-1", "shadow", "max-h-40", "overflow-y-auto", "hidden")
suggestions.style.top = "40px";
suggestions.style.left = "0";
suggestions.style.right = "0";
suggestions.style.zIndex = "1000";

searchBar.addEventListener("input", (e) => {
  const query = normalize(e.target.value.trim());
  suggestions.innerHTML = "";

  if (query === "") {
    suggestions.classList.add("hidden");
    return;
  }

  const matches = categoriesAndSubs.filter(item =>
    normalize(item).includes(query)
  );

  if (!matches.length) {
    suggestions.classList.add("hidden");
    return;
  }
searchBar = document.getElementById("searchBar");
  matches.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    li.className = "p-2 hover:bg-gray-100 cursor-pointer";
    li.addEventListener("click", () => {
      searchBar.value = item;
      suggestions.classList.add("hidden");

      const event = new Event("input", { bubbles: true });
      searchBar.dispatchEvent(event);
    });
    suggestions.appendChild(li);
  });

  suggestions.classList.remove("hidden");
});

document.addEventListener("click", (e) => {
  if (!e.target.closest("#search-bar")) {
    suggestions.classList.add("hidden");
  }
});
