function downloadFile(filename, bytes) {
    try {
        const blob = new Blob([bytes], { type: "application/octet-stream" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url); // cleanup
    } catch (e) {
        console.error("downloadFile error", e);
    }
}

// Small site initialization helpers
window.site = {
    initCarousels: function () {
        try {
            if (typeof bootstrap === "undefined" || !bootstrap.Carousel) return;
            document.querySelectorAll(".carousel").forEach(function (el) {
                if (!el._bs_carousel) {
                    const intervalAttr = el.getAttribute("data-bs-interval");
                    const interval = intervalAttr ? parseInt(intervalAttr, 10) : 4000;
                    const carousel = new bootstrap.Carousel(el, { interval: interval, ride: "carousel" });
                    el._bs_carousel = carousel;
                }
            });
        } catch (e) {
            console.warn("initCarousels error", e);
        }
    },

    // LocalStorage helpers for persisting small JSON blobs (e.g. last report)
    localStorageSet: function (key, json) {
        try {
            localStorage.setItem(key, json);
            return true;
        } catch (e) {
            console.warn("localStorageSet error", e);
            return false;
        }
    },

    localStorageGet: function (key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.warn("localStorageGet error", e);
            return null;
        }
    },

    localStorageRemove: function (key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.warn("localStorageRemove error", e);
            return false;
        }
    },

    // Convenience: store/retrieve JSON objects
    localStorageSetJson: function (key, obj) {
        try {
            const json = JSON.stringify(obj);
            return window.site.localStorageSet(key, json);
        } catch (e) {
            console.warn("localStorageSetJson error", e);
            return false;
        }
    },

    localStorageGetJson: function (key) {
        try {
            const val = window.site.localStorageGet(key);
            return val ? JSON.parse(val) : null;
        } catch (e) {
            console.warn("localStorageGetJson error", e);
            return null;
        }
    }
};

document.addEventListener("DOMContentLoaded", function () {
    window.site.initCarousels();
});
