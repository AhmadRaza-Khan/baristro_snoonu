async function reRenderData(tab) {
    setLoading(true, container);
    try {
        const url =
            tab === "Synced Products" ? "/product/get-synced" :
            tab === "Non Synced Products" ? "/product/get-unsynced" :
            tab === "Changed Prices" ? "/inventory/price-changes" :
            "";
        if (!url) {
            console.warn("Unknown tab:", tab);
            return;
        }

        const res = await fetch(url);
        const freshData = await res.json();
        renderData(tab, freshData);
    } catch (err) {
        console.error("Error refreshing products:", err);
    } finally {
        setLoading(false, container);
    }
}
