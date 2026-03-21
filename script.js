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
        appendMessage("ai", "Lo sentimos, hubo un error al procesar tu consulta. Por favor intentá nuevamente.");
        console.error("API Error:", error);
    }

    btnSend.disabled = false;
    userInput.focus();
    scrollToBottom();
}

async function callAPI(message, history) {
    const response = await fetch(CONFIG.API_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            message: message,
            history: history,
        }),
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    let formatReply = reply.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

    formatReply = formatReply.replace(/\n/g, '<br>');

    bubble.innerHTML = formatReply;


    return data.reply || data.choices?.[0]?.message?.content || "Sin respuesta.";
}

function appendMessage(role, text) {
    const isAI = role === "ai";
    const time = getTime();

    const row = document.createElement("div");
    row.className = `message-row ${isAI ? "ai" : "user"}`;

    row.innerHTML = `
        <div class="msg-avatar ${isAI ? "ai-avatar" : "user-avatar"}">
            ${isAI ? CONFIG.BOT_INITIALS : CONFIG.USER_INITIALS}
        </div>
        <div class="msg-content">
            <div class="msg-bubble">${escapeHTML(text)}</div>
            <span class="msg-time">${time}</span>
        </div>
    `;

    chatMessages.appendChild(row);
    scrollToBottom();
}

function showTyping() {
    const row = document.createElement("div");
    row.className = "message-row ai";
    row.id = "typingRow";
    row.innerHTML = `
        <div class="msg-avatar ai-avatar">${CONFIG.BOT_INITIALS}</div>
        <div class="msg-content">
            <div class="typing-bubble">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    chatMessages.appendChild(row);
    scrollToBottom();
    return row;
}

function removeTyping(el) {
    if (el && el.parentNode) el.parentNode.removeChild(el);
}

function hideChatWelcome() {
    if (chatWelcome) chatWelcome.style.display = "none";
}

function createNewConversation() {
    const id = Date.now().toString();
    const conv = { id, title: "Nueva consulta", messages: [] };
    conversations.unshift(conv);
    activeConvId = id;
    saveConversations();
    renderChatList();
    clearChatMessages();
    if (chatWelcome) chatWelcome.style.display = "block";
}

function clearChatMessages() {
    const rows = chatMessages.querySelectorAll(".message-row");
    rows.forEach(r => r.remove());
    if (chatWelcome) chatWelcome.style.display = "block";
}

function addMessageToConversation(convId, role, text) {
    const conv = conversations.find(c => c.id === convId);
    if (conv) {
        conv.messages.push({ role, text, time: getTime() });
        saveConversations();
    }
}

function getConversationHistory(convId) {
    const conv = conversations.find(c => c.id === convId);
    return conv ? conv.messages.map(m => ({ role: m.role, content: m.text })) : [];
}

function updateChatTitle(convId, text) {
    const conv = conversations.find(c => c.id === convId);
    if (conv && conv.title === "Nueva consulta") {
        conv.title = text.length > 36 ? text.slice(0, 36) + "..." : text;
        saveConversations();
        renderChatList();
    }
}

function renderChatList() {
    chatList.innerHTML = "";
    if (conversations.length === 0) {
        chatList.innerHTML = `<li style="color:#4a443e;font-size:12px;padding:8px 12px;cursor:default">Sin historial</li>`;
        return;
    }
    conversations.forEach(conv => {
        const li = document.createElement("li");
        li.textContent = conv.title;
        li.title = conv.title;
        if (conv.id === activeConvId) li.classList.add("active");
        li.addEventListener("click", () => loadConversation(conv.id));
        chatList.appendChild(li);
    });
}

function loadConversation(convId) {
    activeConvId = convId;
    clearChatMessages();
    const conv = conversations.find(c => c.id === convId);
    if (!conv) return;
    if (conv.messages.length === 0) {
        if (chatWelcome) chatWelcome.style.display = "block";
        return;
    }
    hideChatWelcome();
    conv.messages.forEach(m => appendMessage(m.role, m.text));
    renderChatList();
    if (window.innerWidth <= 768) sidebar.classList.remove("open");
}

function saveConversations() {
    try {
        localStorage.setItem("iso_conversations", JSON.stringify(conversations));
    } catch (_) { }
}

function loadConversations() {
    try {
        const stored = localStorage.getItem("iso_conversations");
        if (stored) conversations = JSON.parse(stored);
    } catch (_) {
        conversations = [];
    }
}

function autoResize(el) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getTime() {
    return new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

function escapeHTML(text) {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
    return text.replace(/[&<>"']/g, m => map[m]);
}   