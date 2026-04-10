getUnsplash();

showRemaining(localStorage.getItem("unsplash_remaining") || 50);

function getUnsplash() {
    const cachedUrl = localStorage.getItem("unsplash_bg_cache");
    const cachedUrlTimestamp = Number(localStorage.getItem("unsplash_bg_cache_timestamp"));


    const INTERVAL = 10 * 60 * 1000;
    if (cachedUrl && cachedUrlTimestamp && (Date.now() - cachedUrlTimestamp < INTERVAL)) {
        let cachedDate = new Date(cachedUrlTimestamp);
        console.log("Using cached background from " + cachedDate.toLocaleString())
        applyBackground(cachedUrl);
        return;
    }

    const k = atob('djJLNUg5OTc4WWY2MnlUbkRVZ2Q4NWJ1eTEzWDFhankwQnBiakdWYkRnMA==');
    const headers = { "Authorization": `Client-ID ${k}` };

    fetch("https://api.unsplash.com/photos/random?query=Touhoku", { headers: headers })
        .then(response => {
            if (!response.ok) {
                console.error("Network response was not ok", response);
                return response.text();
            }

            const remaining = response.headers.get("X-RateLimit-Remaining");
            console.log(`Rate Limit Remaining: ${remaining}`);
            localStorage.setItem("unsplash_remaining", remaining);
            showRemaining(remaining);

            return response.json();
        })
        .then(data => {
            console.debug(data);

            let url = data.urls.raw;
            if (Boolean(url)) {
                console.log("Got fresh URL: " + url);
                localStorage.setItem("unsplash_bg_cache", url);
                localStorage.setItem("unsplash_bg_cache_timestamp", Date.now());
                applyBackground(url);
            }
            else {
                console.warn("No urls found: ", data);
                applyBackground("https://picsum.photos/2000");
            }
        })
        .catch(err => {
            console.warn("Error encountered: ", err);
            applyBackground("https://picsum.photos/2000");
        });
}

function applyBackground(url) {
    document.body.style.backgroundImage = `url(${url})`;
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
