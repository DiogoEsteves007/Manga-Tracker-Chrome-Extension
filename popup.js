let token = null;

// Alternar entre views
document.getElementById("settingsBtn").addEventListener("click", () => {
  const mainView = document.getElementById("mainView");
  const settingsView = document.getElementById("settingsView");

  const isMainVisible = mainView.style.display !== "none";

  if (isMainVisible) {
    // Mostrar settings
    mainView.style.display = "none";
    settingsView.style.display = "block";
    document.getElementById("title").innerText = "Definições";
    loadSettings();
  } else {
    // Voltar ao main
    settingsView.style.display = "none";
    mainView.style.display = "block";
    document.getElementById("title").innerText = "Manhwa Tracker";
  }
});

// Carregar configurações no input
function loadSettings() {
  chrome.storage.sync.get(["sheetId", "sheetName"], (data) => {
    document.getElementById("sheetId").value = data.sheetId || "";
    document.getElementById("sheetName").value = data.sheetName || "";
  });
}

// Guardar configurações
document.getElementById("saveConfig").addEventListener("click", () => {
  const sheetId = document.getElementById("sheetId").value.trim();
  const sheetName = document.getElementById("sheetName").value.trim();

  chrome.storage.sync.set({ sheetId, sheetName }, () => {
    document.getElementById("statusConfig").innerText = "Configurações guardadas!";
    setTimeout(() => document.getElementById("statusConfig").innerText = "", 2000);
  });
});

// Obter separador atual
async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

// Parsers por website
const siteParsers = {
  "asuracomic.net": (tab) => {
    const match = tab.title.match(/^(.+?)\s+Chapter\s+(\d+)\s*[-–]\s*Asura\s*Scans/i);
    if (match) return { nome: match[1].trim(), capitulo: match[2].trim() };
    return { nome: "", capitulo: "" };
  },
  "default": (tab) => {
    let nome = tab.title || "";
    let capitulo = "";
    const urlMatch = tab.url.match(/(\d+)(?!.*\d)/);
    if (urlMatch) capitulo = urlMatch[1];
    return { nome, capitulo };
  }
};

// Auto-preencher nome e capítulo
async function autoPreencher() {
  const tab = await getCurrentTab();
  const parserKey = Object.keys(siteParsers).find(key => tab.url.includes(key)) || "default";
  const resultado = siteParsers[parserKey](tab);

  const nome = resultado.nome || "";
  const capitulo = resultado.capitulo || "";

  document.getElementById("nome").value = nome;
  document.getElementById("capitulo").value = capitulo;

  if (!nome || !capitulo) {
    document.getElementById("status").innerText = "Não foi possível preencher automaticamente. Preencha manualmente.";
  }
}

// Função para adicionar ou atualizar linha no Google Sheets
async function addOrUpdateRow(nome, capitulo, url, SPREADSHEET_ID, SHEET_NAME) {
  const headers = { "Authorization": "Bearer " + token, "Content-Type": "application/json" };
  const readRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A:D`, { headers });
  const data = await readRes.json();
  let values = data.values || [];

  let rowIndex = -1;
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === nome) { rowIndex = i; break; }
  }

  if (rowIndex >= 0) {
    const updateBody = { values: [[nome, url, "A Ler", capitulo]] };
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A${rowIndex+1}:D${rowIndex+1}?valueInputOption=RAW`, {
      method: "PUT", headers, body: JSON.stringify(updateBody)
    });
  } else {
    const appendBody = { values: [[nome, url, "A Ler", capitulo]] };
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!A:D:append?valueInputOption=RAW`, {
      method: "POST", headers, body: JSON.stringify(appendBody)
    });
  }
}

// Botão de guardar (faz login se necessário)
document.getElementById("saveBtn").addEventListener("click", async () => {
  const nome = document.getElementById("nome").value.trim();
  const capitulo = document.getElementById("capitulo").value;

  if (!nome || !capitulo) {
    document.getElementById("status").innerText = "Preencha Nome e Capítulo!";
    return;
  }

  chrome.storage.sync.get(["sheetId", "sheetName"], (config) => {
    if (!config.sheetId || !config.sheetName) {
      document.getElementById("status").innerText =
        "Precisas definir o ID do Sheets e o nome da planilha nas Definições!";
      return;
    }
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0].url;

      chrome.runtime.sendMessage({
        action: "saveManga",
        data: { nome, capitulo, url, SPREADSHEET_ID: config.sheetId, SHEET_NAME: config.sheetName }
      }, (response) => {
        if (response.success) {
          document.getElementById("status").innerText = "Guardado no Google Sheets!";
        } else {
          document.getElementById("status").innerText = "Erro: " + response.error;
        }
      });
    });

    // saveManga(nome, capitulo, config.sheetId, config.sheetName);
  });
});

// async function saveManga(nome, capitulo, SPREADSHEET_ID, SHEET_NAME) {
//   const tab = await getCurrentTab();
//   const url = tab.url;

//   if (!nome || !capitulo) {
//     document.getElementById("status").innerText = "Preencha Nome e Capítulo!";
//     return;
//   }

//   try {
//     if (!token) {
//       token = await new Promise((resolve, reject) => {
//         chrome.identity.getAuthToken({ interactive: true }, tok => {
//           if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
//           else resolve(tok);
//         });
//       });
//       document.getElementById("status").innerText = "Autenticado com Google!";
//     }

//     await addOrUpdateRow(nome, capitulo, url, SPREADSHEET_ID, SHEET_NAME);

//     chrome.storage.local.get(["cacheLeituras"], (store) => {
//       let cache = store.cacheLeituras || {};
//       cache[nome] = parseInt(capitulo);
//       chrome.storage.local.set({cacheLeituras: cache});
//     });

//     document.getElementById("status").innerText = "Guardado no Google Sheets!";
//   } catch (err) {
//     console.error("Erro:", err);
//     document.getElementById("status").innerText = "Erro ao guardar: " + err.message;
//   }
// }

autoPreencher();

