const titulo = document.title;

const sitePatterns = {
  "asuracomic.net": { mainPage: url => !url.includes("/chapter/") },
};


function limparNome(titulo) {
    return titulo
        .replace(/[-–—]\s*Asura\s*Scans.*$/i, "")
        .replace(/Asura\s*Scans.*$/i, "")
        .replace(/[-–—]\s*(Scans?|Scanlation|Team).*$/i, "")
        .replace(/Chapter\s*\d+.*/i, "")
        .replace(/Cap[ií]tulo\s*\d+.*/i, "")
        .replace(/Ep(is[oó]dio)?\s*\d+.*/i, "")
        .replace(/Ch\.\s*\d+.*/i, "")
        .replace(/[-–—]\s*$/i, "")
        .trim();
}

const nomeManga = limparNome(titulo);

const url = window.location.href;

if (nomeManga.length > 0 && !url.includes("/chapter/")) {
    chrome.storage.local.get(["cacheLeituras"], (store) => {
        const cache = store.cacheLeituras || {};

        if (cache[nomeManga]) {
            const ultimoCapitulo = cache[nomeManga];

            const aviso = document.createElement("div");
            aviso.innerText = `Último capítulo lido: ${ultimoCapitulo}`;

            Object.assign(aviso.style, {
                position: "fixed",
                top: "20px",
                right: "20px",
                padding: "12px 18px",
                background: "linear-gradient(135deg, #4CAF50, #2E7D32)",
                color: "white",
                fontSize: "14px",
                fontWeight: "500",
                borderRadius: "12px",
                zIndex: "999999",
                boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
                fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
                opacity: "0",
                transform: "translateY(-20px)",
                transition: "opacity 0.4s ease, transform 0.4s ease"
            });

            document.body.appendChild(aviso);
            
            // Animação de entrada
            requestAnimationFrame(() => {
                aviso.style.opacity = "1";
                aviso.style.transform = "translateY(0)";
            });

            setTimeout(() => {
                aviso.style.opacity = "0";
                aviso.style.transform = "translateY(-20px)";
                setTimeout(() => aviso.remove(), 400);
            }, 6000);
        }
    });
}
