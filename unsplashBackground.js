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

        const k = atob("djJLN0g5OTc4WWY2MnlUbkRVZ2Q4NWJ1eTEzWDFhankeMEJwYmpHVmJEMG==");
        const headers = { "Authorization": `Client-ID ${k}` };

        fetch("https://api.unsplash.com/search/photos?query=Japan&&per_page=1&&page=" + randomPage, { headers: headers })
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
                let results = data.results;
                if(results) {
                    let url = results[0].urls.raw;
                    console.log("Got fresh URL: " + url);
                    localStorage.setItem("unsplash_bg_cache", url);
                    localStorage.setItem("unsplash_bg_cache_timestamp", Date.now());
                    applyBackground(url);
                }
                else {
                    console.warn("No results found: ", data);
                    applyBackground("https://picsum.photos/2000");
                }
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