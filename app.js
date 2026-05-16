const weekdayMap = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
const schoolData = window.SCHOOL_DATA || {};
const messagesEl = document.querySelector("#chatMessages");
const formEl = document.querySelector("#chatForm");
const inputEl = document.querySelector("#messageInput");
const todayMealEl = document.querySelector("#todayMeal");
const nextEventEl = document.querySelector("#nextEvent");
const schoolNameEl = document.querySelector("#schoolName");
const schoolSubtitleEl = document.querySelector("#schoolSubtitle");
const schoolInitialsEl = document.querySelector("#schoolInitials");
const chatbotConfig = window.CHATBOT_CONFIG || {};

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[º°]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDate(dateText) {
  const date = new Date(`${dateText}T12:00:00`);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getTodayMeal() {
  const weekday = weekdayMap[new Date().getDay()];
  return schoolData.merenda?.[weekday] || "Nao ha cardapio cadastrado para hoje.";
}

function getUpcomingEvents() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (schoolData.eventos || [])
    .filter((event) => new Date(`${event.date}T12:00:00`) >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
}

function findScheduleKey(question) {
  const normalized = normalizeText(question);
  return Object.keys(schoolData.horarios || {}).find((key) => normalized.includes(normalizeText(key)));
}

function formatSchedule(className) {
  const lessons = schoolData.horarios[className];
  const lessonList = lessons.map(([time, subject]) => `${time} - ${subject}`).join("\n");
  return `Horario da turma ${className}:\n${lessonList}`;
}

function findCustomAnswer(question) {
  const normalized = normalizeText(question);
  return (schoolData.respostas || []).find((item) => {
    return (item.palavras || []).some((keyword) => normalized.includes(normalizeText(keyword)));
  });
}

function answerQuestion(question) {
  const normalized = normalizeText(question);
  const scheduleKey = findScheduleKey(question);
  const customAnswer = findCustomAnswer(question);

  if (customAnswer) {
    return customAnswer.resposta;
  }

  if (normalized.includes("merenda") || normalized.includes("cardapio") || normalized.includes("lanche")) {
    return `A merenda de hoje e: ${getTodayMeal()}`;
  }

  if (normalized.includes("evento") || normalized.includes("calendario") || normalized.includes("reuniao")) {
    const events = getUpcomingEvents();
    if (!events.length) {
      return "Nao ha eventos futuros cadastrados no momento.";
    }
    return events
      .map((event) => `${formatDate(event.date)} - ${event.title}: ${event.detail}`)
      .join("\n");
  }

  if (normalized.includes("horario") || normalized.includes("aula") || scheduleKey) {
    if (scheduleKey) {
      return formatSchedule(scheduleKey);
    }

    const classes = Object.keys(schoolData.horarios || {}).join(", ");
    return `Para consultar o horario, informe a turma. Turmas cadastradas: ${classes}.`;
  }

  if (normalized.includes("secretaria") || normalized.includes("contato") || normalized.includes("telefone")) {
    return schoolData.contatos?.secretaria || "Contato da secretaria ainda nao cadastrado.";
  }

  if (normalized.includes("coordenacao") || normalized.includes("coordenador")) {
    return schoolData.contatos?.coordenacao || "Contato da coordenacao ainda nao cadastrado.";
  }

  if (normalized.includes("aviso") || normalized.includes("recado") || normalized.includes("comunicado")) {
    const notices = schoolData.avisos || [];
    return notices.length ? `Avisos:\n${notices.join("\n")}` : "Nao ha avisos cadastrados no momento.";
  }

  if (normalized.includes("ajuda") || normalized.includes("ola") || normalized.includes("oi")) {
    return schoolData.escola?.saudacao || "Ola! Posso ajudar com horario de aulas, cardapio da merenda e eventos.";
  }

  return "Ainda nao encontrei essa informacao. Tente perguntar sobre merenda, horario de uma turma, eventos ou secretaria.";
}

function escapeHTML(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\n/g, "<br>");
}

function addMessage(author, text, type) {
  const message = document.createElement("article");
  message.className = `message message--${type}`;
  message.innerHTML = `<strong>${escapeHTML(author)}</strong><span>${escapeHTML(text)}</span>`;
  messagesEl.appendChild(message);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return message;
}

function readN8nAnswer(payload) {
  if (typeof payload === "string") {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return "";
  }

  return payload.resposta || payload.answer || payload.message || payload.text || payload.output || "";
}

async function askN8n(question) {
  if (!chatbotConfig.useN8n) {
    return "";
  }

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pergunta: question,
      origem: "chatbot-escolar",
      dataHora: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error("Resposta invalida do n8n");
  }

  return readN8nAnswer(await response.json());
}

async function handleQuestion(question) {
  addMessage("Voce", question, "user");
  const loadingMessage = addMessage("Assistente", "Consultando as informacoes...", "bot");

  try {
    const n8nAnswer = await askN8n(question);
    const answer = n8nAnswer || answerQuestion(question);
    loadingMessage.querySelector("span").innerHTML = escapeHTML(answer);
  } catch (error) {
    const fallback = answerQuestion(question);
    loadingMessage.querySelector("span").innerHTML = escapeHTML(
      `${fallback}\n\nObservacao: nao consegui consultar o n8n agora, entao respondi com os dados locais.`
    );
  }
}

function fillDashboard() {
  todayMealEl.textContent = getTodayMeal();
  const [event] = getUpcomingEvents();
  nextEventEl.textContent = event ? `${formatDate(event.date)} - ${event.title}` : "Sem eventos cadastrados";
}

function fillBranding() {
  const school = schoolData.escola || {};
  const name = school.nome || "Chatbot Escolar";

  document.title = name;
  schoolNameEl.textContent = name;
  schoolSubtitleEl.textContent = school.subtitulo || "Assistente escolar";
  schoolInitialsEl.textContent = school.sigla || "CE";
}

formEl.addEventListener("submit", (event) => {
  event.preventDefault();
  const question = inputEl.value.trim();

  if (!question) {
    return;
  }

  inputEl.value = "";
  handleQuestion(question);
});

document.querySelectorAll("[data-question]").forEach((button) => {
  button.addEventListener("click", () => {
    handleQuestion(button.dataset.question);
  });
});

fillBranding();
fillDashboard();
addMessage("Assistente", schoolData.escola?.saudacao || "Ola! Como posso ajudar?", "bot");
