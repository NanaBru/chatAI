const CONFIG = {
    API_ENDPOINT: "https://twilight-sunset-bc1e.nahumsouza2003.workers.dev",
    COMPANY_NAME: "Isopaneles",
    BOT_INITIALS: "IA",
    USER_INITIALS: "TU",
};

let conversations = [];
let activeConvId = null;

const chatMessages = document.getElementById("chatMessages");
const chatWelcome = document.getElementById("chatWelcome");
const chatList = document.getElementById("chatList");
const userInput = document.getElementById("userInput");
const btnSend = document.getElementById("btnSend");
const btnNewChat = document.getElementById("btnNewChat");
const btnMenu = document.getElementById("btnMenu");
const sidebar = document.querySelector(".sidebar");
const quickBtns = document.querySelectorAll(".quick-btn");

document.addEventListener("DOMContentLoaded", () => {
    loadConversations();
    renderChatList();
    setupEventListeners();
});

function setupEventListeners() {
    btnSend.addEventListener("click", handleSend);

    userInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    userInput.addEventListener("input", () => {
        autoResize(userInput);
    });

    btnNewChat.addEventListener("click", createNewConversation);

    btnMenu.addEventListener("click", () => {
        sidebar.classList.toggle("open");
    });

    document.addEventListener("click", (e) => {
        if (sidebar.classList.contains("open") &&
            !sidebar.contains(e.target) &&
            e.target !== btnMenu) {
            sidebar.classList.remove("open");
        }
    });

    quickBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            const question = btn.getAttribute("data-question");
            userInput.value = question;
            autoResize(userInput);
            handleSend();
        });
    });

    const btnCotizar = document.querySelector(".btn-cotizar"); 
    if (btnCotizar) {
        btnCotizar.addEventListener("click", handleCotizacion);
    }
}

async function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;
    if (!activeConvId) createNewConversation();

    userInput.value = "";
    autoResize(userInput);
    btnSend.disabled = true;

    hideChatWelcome();
    appendMessage("user", text);
    addMessageToConversation(activeConvId, "user", text);
    updateChatTitle(activeConvId, text);

    const typingEl = showTyping();

    try {
        const responseText = await callAPI(text, getConversationHistory(activeConvId));
        removeTyping(typingEl);
        appendMessage("ai", responseText);
        addMessageToConversation(activeConvId, "ai", responseText);
    } catch (error) {
        removeTyping(typingEl);
        appendMessage("ai", "Error al procesar. Reintentá.");
    }

    btnSend.disabled = false;
    userInput.focus();
    scrollToBottom();
}

async function callAPI(message, history) {
    const response = await fetch(CONFIG.API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message, history: history }),
    });
    const data = await response.json();
    return data.reply || "Sin respuesta.";
}

function appendMessage(role, text) {
    const isAI = role === "ai";
    const time = getTime();
    const row = document.createElement("div");
    row.className = `message-row ${isAI ? "ai" : "user"}`;

    let processedText = escapeHTML(text);

    if (isAI) {
        processedText = processedText.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        processedText = processedText.replace(/^## (.*$)/gim, '<h3>$1</h3>');
        processedText = processedText.replace(/^# (.*$)/gim, '<h3>$1</h3>');
        processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
        processedText = processedText.replace(/^\- (.*$)/gim, '<li>$1</li>');
        if (processedText.includes('<li>')) {
            processedText = processedText.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>').replace(/<\/ul><ul>/g, '');
        }
        processedText = processedText.replace(/\n/g, '<br>');
    }

    row.innerHTML = `
        <div class="msg-avatar ${isAI ? "ai-avatar" : "user-avatar"}">${isAI ? CONFIG.BOT_INITIALS : CONFIG.USER_INITIALS}</div>
        <div class="msg-content">
            <div class="msg-bubble">${processedText}</div>
            <span class="msg-time">${time}</span>
        </div>`;
    chatMessages.appendChild(row);
    scrollToBottom();
}

function formatForWhatsApp(text) {
    let clean = text;
    clean = clean.replace(/^#+ (.*$)/gim, '*$1*');
    clean = clean.replace(/\*\*(.*?)\*\*/g, '*$1*');
    clean = clean.replace(/^\- /gim, '• ');
    return clean;
}

async function handleCotizacion() {
    if (!activeConvId || getConversationHistory(activeConvId).length === 0) {
        alert("Primero contame qué necesitás.");
        return;
    }
    const typingEl = showTyping();
    try {
        const promptResumen = "Generá un RESUMEN TÉCNICO. Solo listá los productos, ubicación y envío (si se mencionaron). NO agregues campos para nombre, teléfono ni horarios.";
        const resumen = await callAPI(promptResumen, getConversationHistory(activeConvId));
        removeTyping(typingEl);
        appendMessage("ai", "Aquí tenés el resumen para enviar:");
        renderFormularioContacto(resumen);
    } catch (error) {
        removeTyping(typingEl);
    }
}

function renderFormularioContacto(resumenOriginal) {
    const row = document.createElement("div");
    row.className = "message-row ai";
    row.innerHTML = `
        <div class="msg-avatar ai-avatar">ISO</div>
        <div class="msg-content">
            <div class="msg-bubble" style="background: #fdfaf6; border: 1px solid #d4c5b9;">
                <p><b>Datos para el vendedor:</b></p>
                <input type="text" id="form-nombre" placeholder="Nombre" style="width:100%; margin: 5px 0; padding: 8px; border-radius: 5px; border: 1px solid #ccc;">
                <input type="tel" id="form-tel" placeholder="WhatsApp" style="width:100%; margin: 5px 0; padding: 8px; border-radius: 5px; border: 1px solid #ccc;">
                <button id="btn-final-enviar" style="background: #7a4f37; color: white; border: none; padding: 10px; width: 100%; cursor: pointer; margin-top: 10px; border-radius: 5px; font-weight: bold;">
                    ENVIAR POR WHATSAPP
                </button>
            </div>
        </div>`;
    chatMessages.appendChild(row);
    scrollToBottom();

    document.getElementById("btn-final-enviar").addEventListener("click", () => {
        const nombre = document.getElementById("form-nombre").value;
        const tel = document.getElementById("form-tel").value;
        if (!nombre || !tel) return alert("Completá los datos.");

        const resumenWA = formatForWhatsApp(resumenOriginal);
        const mensajeFinal = `*NUEVO PEDIDO WEB*\n\n*Cliente:* ${nombre}\n*Contacto:* ${tel}\n\n${resumenWA}`;
        window.open(`https://wa.me/59895927568?text=${encodeURIComponent(mensajeFinal)}`, '_blank');
    });
}

function showTyping() {
    const row = document.createElement("div");
    row.className = "message-row ai";
    row.id = "typingRow";
    row.innerHTML = `<div class="msg-avatar ai-avatar">${CONFIG.BOT_INITIALS}</div><div class="msg-content"><div class="typing-bubble"><span></span><span></span><span></span></div></div>`;
    chatMessages.appendChild(row);
    scrollToBottom();
    return row;
}

function removeTyping(el) { if (el && el.parentNode) el.parentNode.removeChild(el); }
function hideChatWelcome() { if (chatWelcome) chatWelcome.style.display = "none"; }
function createNewConversation() { const id = Date.now().toString(); conversations.unshift({ id, title: "Nueva consulta", messages: [] }); activeConvId = id; saveConversations(); renderChatList(); clearChatMessages(); }
function clearChatMessages() { chatMessages.querySelectorAll(".message-row").forEach(r => r.remove()); if (chatWelcome) chatWelcome.style.display = "block"; }
function addMessageToConversation(id, role, text) { const c = conversations.find(x => x.id === id); if (c) { c.messages.push({ role, text }); saveConversations(); } }
function getConversationHistory(id) { const c = conversations.find(x => x.id === id); return c ? c.messages.map(m => ({ role: m.role, content: m.text })) : []; }
function updateChatTitle(id, text) { const c = conversations.find(x => x.id === id); if (c && c.title === "Nueva consulta") { c.title = text.slice(0, 30); renderChatList(); } }
function renderChatList() { chatList.innerHTML = ""; conversations.forEach(c => { const li = document.createElement("li"); li.textContent = c.title; if (c.id === activeConvId) li.className = "active"; li.onclick = () => loadConversation(c.id); chatList.appendChild(li); }); }
function loadConversation(id) { activeConvId = id; clearChatMessages(); const c = conversations.find(x => x.id === id); if (c) { hideChatWelcome(); c.messages.forEach(m => appendMessage(m.role, m.text)); } renderChatList(); }
function saveConversations() { localStorage.setItem("iso_conversations", JSON.stringify(conversations)); }
function loadConversations() { const s = localStorage.getItem("iso_conversations"); if (s) conversations = JSON.parse(s); }
function autoResize(el) { el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; }
function scrollToBottom() { chatMessages.scrollTop = chatMessages.scrollHeight; }
function getTime() { return new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }); }
function escapeHTML(t) { const m = {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}; return t.replace(/[&<>"']/g, x => m[x]); }