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

        let max = 999;  //manually or automatically update this later
        let randomPage = Math.floor(Math.random() * max);

        const headers = { "Authorization": "Client-ID v2K5H9978Yf62yTnDUgd85buy13X1ajy0BpbjGVbDg0" };   // to hide - lol

        fetch("https://api.unsplash.com/search/photos?query=Japan&&per_page=1&&page=" + randomPage, { headers: headers })
            .then(response => {
                if (!response.ok) throw new Error("Network response was not ok");

                const remaining = response.headers.get("X-RateLimit-Remaining");
                console.log(`Rate Limit Remaining: ${remaining}`);
                localStorage.setItem("unsplash_remaining", remaining);
                showRemaining(remaining);
                
                return response.json();
            })  
            .then(data => {
                console.debug(data);
                let url = data.results[0].urls.raw;
                console.log("Got fresh URL: " + url);
                localStorage.setItem("unsplash_bg_cache", url);
                localStorage.setItem("unsplash_bg_cache_timestamp", Date.now());
                applyBackground(url);
            });
    }

    function applyBackground(url) {
        document.body.style.backgroundImage = `url(${url})`;
    }

    function showRemaining(remaining) {
        let span = document.createElement("span");
        span.classList.add("bottom-left");
        span.innerText = remaining;
        document.body.appendChild(span);
    }