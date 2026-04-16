const k = atob('djJLNUg5OTc4WWY2MnlUbkRVZ2Q4NWJ1eTEzWDFhankwQnBiakdWYkRnMA==');
const headers = { "Authorization": `Client-ID ${k}` };
const query = "Touhoku";
const MINUTES = 15;
const INTERVAL = MINUTES * 60 * 1000;

getUnsplash();
showRemaining(localStorage.getItem("unsplash_remaining") || 50);

async function getUnsplash() {
    const cachedImage = localStorage.getItem("unsplash_bg_image");
    const cachedNextImage = localStorage.getItem("unsplash_bg_next");
    const cachedTimestamp = Number(localStorage.getItem("unsplash_bg_timestamp"));
    const isStale = !cachedTimestamp || (Date.now() - cachedTimestamp >= INTERVAL);

    if (cachedNextImage && isStale) {
        console.log("Applying pre-fetched next image");
        localStorage.setItem("unsplash_bg_image", cachedNextImage);
        localStorage.removeItem("unsplash_bg_next");
        localStorage.setItem("unsplash_bg_timestamp", Date.now());
        applyBackground(cachedNextImage);

        // Quietly fetch the next one for next time
        const url = await fetchNextImageUrl();
        const base64 = await convertUrlToBase64(url);
        localStorage.setItem("unsplash_bg_next", base64);

    } else if (cachedImage) {
        let cachedDate = new Date(cachedTimestamp);
        console.log("Using cached image from " + cachedDate.toLocaleString());
        applyBackground(cachedImage);

        if (isStale) {
            const url = await fetchNextImageUrl();
            const base64 = await convertUrlToBase64(url);
            localStorage.setItem("unsplash_bg_next", base64);
        }

    } else {
        console.log("Cold start, fetching fresh...");
        const url = await fetchNextImageUrl();
        const base64 = await convertUrlToBase64(url);
        localStorage.setItem("unsplash_bg_image", base64);
        localStorage.setItem("unsplash_bg_timestamp", Date.now());
        applyBackground(base64);
    }
}

async function fetchNextImageUrl() {
    const fallbackUrl = "https://picsum.photos/2000";
    try {
        const response = await fetch(
            "https://api.unsplash.com/photos/random?query=" + query,
            { headers }
        );

        if (!response.ok) {
            console.error("Unsplash network error", response.status);
            return fallbackUrl;
        }

        const remaining = response.headers.get("X-RateLimit-Remaining");
        console.log(`Rate Limit Remaining: ${remaining}`);
        localStorage.setItem("unsplash_remaining", remaining);
        showRemaining(remaining);

        const data = await response.json();
        const url = data?.urls?.raw;

        if (url) {
            console.log("Got fresh URL: " + url);
            return url + "&w=1920&q=80&fm=jpg";
        } else {
            console.warn("No URL in response: ", data);
            return fallbackUrl;
        }
    } catch (err) {
        console.warn("Error fetching from Unsplash: ", err);
        return fallbackUrl;
    }
}

async function convertUrlToBase64(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const binary = bytes.reduce((acc, b) => acc + String.fromCharCode(b), '');
    return `data:${blob.type};base64,${btoa(binary)}`;
}

function applyBackground(base64) {
    document.body.style.backgroundImage = `url(${base64})`;
}

function showRemaining(remaining) {
    let span = document.getElementById("remaining-span");
    if (!span) {
        span = document.createElement("span");
        span.id = "remaining-span";
        span.classList.add("bottom-left");
        document.body.appendChild(span);
    }
    span.innerText = remaining;
}