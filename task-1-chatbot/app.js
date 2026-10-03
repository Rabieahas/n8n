// כתובת הצ׳אט שפורסם ב-n8n.
const CHAT_URL = "https://rabieahas.app.n8n.cloud/webhook/b8da0841-3268-4f74-baf0-3fb45f73e401/chat";

const form = document.querySelector("#chat-form");
const input = document.querySelector("#user-input");
const messages = document.querySelector("#messages");
const sendButton = form.querySelector("button");

let sessionId = sessionStorage.getItem("cafeHagalilSession");

if (!sessionId) {
  sessionId = crypto.randomUUID?.() ?? String(Date.now());
  sessionStorage.setItem("cafeHagalilSession", sessionId);
}

function addMessage(text, role) {
  const message = document.createElement("div");
  message.className = `message ${role}`;
  message.textContent = text;
  messages.appendChild(message);
  messages.scrollTop = messages.scrollHeight;
  return message;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";

  const waitingMessage = addMessage("רגע, אני בודק…", "bot");
  sendButton.disabled = true;

  try {
    const response = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "sendMessage",
        chatInput: text,
        sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`n8n החזיר שגיאה (${response.status}).`);
    }

    const result = await response.json();
    const reply = Array.isArray(result) ? result[0] : result;

    waitingMessage.textContent =
      reply?.output ??
      reply?.text ??
      reply?.response ??
      "לא התקבלה תשובה מהשרת.";
  } catch (error) {
    waitingMessage.textContent =
      error.message || "לא ניתן להתחבר כרגע. בדקו את כתובת ה-Workflow וההגדרות.";
  } finally {
    sendButton.disabled = false;
    input.focus();
  }
});
