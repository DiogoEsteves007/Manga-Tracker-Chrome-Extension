let token = null;

// Receber mensagem do popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "saveManga") {
    saveManga(msg.data).then(result => {
      sendResponse({ success: true });
    }).catch(err => {
      sendResponse({ success: false, error: err.message });
    });
    return true; // mantém o canal aberto para resposta assíncrona
  }
});

// Função principal para salvar
async function saveManga({ nome, capitulo, url, SPREADSHEET_ID, SHEET_NAME }) {
  
  if (!token) {
    token = await new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, tok => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        else resolve(tok);
      });
    });
  }

  const headers = { "Authorization": "Bearer " + token, "Content-Type": "application/json" };

  // Ler dados existentes
  const readRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A:D`, { headers });
  const data = await readRes.json();
  let values = data.values || [];

  // Procurar linha existente
  let rowIndex = -1;
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === nome) { rowIndex = i; break; }
  }

  if (rowIndex >= 0) {
    // Atualizar
    const updateBody = { values: [[nome, url, "A Ler", capitulo]] };
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A${rowIndex+1}:D${rowIndex+1}?valueInputOption=RAW`, {
      method: "PUT", headers, body: JSON.stringify(updateBody)
    });
  } else {
    // Inserir nova linha
    const appendBody = { values: [[nome, url, "A Ler", capitulo]] };
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A:D:append?valueInputOption=RAW`, {
      method: "POST", headers, body: JSON.stringify(appendBody)
    });
  }

  // Atualizar cache local
  chrome.storage.local.get(["cacheLeituras"], (store) => {
    const cache = store.cacheLeituras || {};
    cache[nome] = parseInt(capitulo);
    chrome.storage.local.set({ cacheLeituras: cache });
  });
}
