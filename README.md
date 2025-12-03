# Manhwa Tracker – Extensão Chrome para Google Sheets

## Descrição

**Manhwa Tracker** é uma extensão de Chrome que permite guardar e atualizar automaticamente os capítulos de manhwas/mangás que está a ler, utilizando o Google Sheets como base de dados.
Esta extensão preenche automaticamente o nome do manga e o capítulo baseado no título do separador do navegador, com suporte a múltiplos websites via parsers customizados.

---

## Funcionalidades 

   - Detecta automaticamente o nome do manga e o capítulo do separador atual.
   - Guarda e atualiza o progresso diretamente no Google Sheets.
   - Permite múltiplos computadores, usando o mesmo Google Sheets como base de dados.
   - Design simples e rápido: botão único para autenticar e guardar.

---

## Como funciona

1. A extensão lê a aba ativa no Chrome para capturar:
   - **Nome do manga** (título da página)  
   - **URL** da aba  
   - **Capítulo** (extraído da URL, se possível)  

2. Faz **login no Google** via OAuth, usando o `chrome.identity.getAuthToken()`.  

3. Conecta-se à **Google Sheets API** com o token OAuth para:
   - **Ler dados existentes** do ficheiro sheets `Manhwa_Database` da planilha `Database`.  
   - **Atualizar** a linha se o manga já existe.  
   - **Adicionar** nova linha se o manga não existir.  

4. Mantém os dados sincronizados entre PCs, bastando usar a mesma conta Google na extensão.  

---

## Configuração passo a passo

### 1️⃣ Criar a ficheiro e planilha Google Sheets

1. Dirigir-se à pagina Google Drive e criar um ficheiro Google Sheets designado de **Manhwa_Database**
2. Cria uma planilha: **Database**  
3. Criar uma tabela chamada **Database**  
4. Colunas (ordem exata):  
Nome | URL | Status | Capítulo

4. Copia o **ID da planilha** da URL entre `/d/` e `/edit` para usar no script.

---

### 2️⃣ Configurar a Extensão Chrome

   - Vá em chrome://extensions/ e ative o Modo de desenvolvedor.
   - Clique em Carregar expandida e selecione a pasta do projeto.
   - Verifique se os arquivos manifest.json, popup.html e popup.js estão na pasta.
   - Copia o **ID** da extensão que aparecerá quando o projeto terminar de ser carregado.

---

### 3️⃣ Criar projeto no Google Cloud

1. Acede: [Google Cloud Console](https://console.cloud.google.com/apis/credentials)  
2. Cria um novo projeto (ex: `Manhwa Tracker`)
3. Vá em APIs & Services → Library e ative a API Google Sheets API.
4. Vá em APIs & Services → OAuth consent screen:
   - User Type: External (mesmo que seja só para você)
   - Preencha nome da app, email do desenvolvedor.
5. Vá em APIs & Services → OAuth consent screen → Target-Audience:
   - Em test_users coloque o seu email
6. Vá em APIs & Services → Credentials → Create Credentials → OAuth Client ID:
   - Tipo: Extensão do Chrome
   - Preencha o nome à sua escolha
   - ID item é o ID da sua extensão obtido no passo 2. 
7. Guarde o client_id gerado

---

### 4️⃣ Configurar manifest.json

- Coloca o **Client ID** no `manifest.json`:
  
```json
"oauth2": {
  "client_id": "SEU_CLIENT_ID.apps.googleusercontent.com",
  "scopes": ["https://www.googleapis.com/auth/spreadsheets"]
}
```
---

### 5️⃣ Configurar popup.js

- Coloca o **ID do ficheiro Google Sheets** no `popup.js` (topo do ficheiro):

---

### 8️⃣ Testar a extensão

1. Em chrome://extensions/ dê reload à extensão
2. Aceda a um website de manga à sua escolha
3. Clique na extensão e depois em guardar (irá inicialmente pedir login via google account) → conceda permissão
4. Se tudo correr bem irá aparecer informações no pop-up da extensão a indicar que foi guardado
5. Confirme no Google Sheets

---
