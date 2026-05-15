const schoolData = {
  contacts: {
    secretaria: "A secretaria atende de segunda a sexta, das 7h30 as 17h. Telefone: (00) 0000-0000.",
    coordenacao: "A coordenacao atende alunos no intervalo da manha e da tarde, mediante disponibilidade.",
  },
  meals: {
    segunda: "Arroz, feijao, carne moida, salada e fruta.",
    terca: "Macarrao ao molho, frango desfiado, legumes e suco.",
    quarta: "Arroz, feijao, frango assado, salada e banana.",
    quinta: "Sopa de legumes com carne e pao.",
    sexta: "Arroz, feijao, omelete, salada e fruta.",
  },
  schedules: {
    "6 ano A": [
      ["07:30", "Matematica"],
      ["08:20", "Portugues"],
      ["09:10", "Ciencias"],
      ["10:20", "Historia"],
      ["11:10", "Educacao Fisica"],
    ],
    "7 ano A": [
      ["07:30", "Portugues"],
      ["08:20", "Geografia"],
      ["09:10", "Matematica"],
      ["10:20", "Artes"],
      ["11:10", "Ciencias"],
    ],
    "8 ano B": [
      ["07:30", "Historia"],
      ["08:20", "Matematica"],
      ["09:10", "Ingles"],
      ["10:20", "Portugues"],
      ["11:10", "Geografia"],
    ],
    "9 ano A": [
      ["07:30", "Ciencias"],
      ["08:20", "Matematica"],
      ["09:10", "Portugues"],
      ["10:20", "Historia"],
      ["11:10", "Projeto de Vida"],
    ],
  },
  events: [
    { date: "2026-05-20", title: "Feira de Ciencias", detail: "Apresentacoes no patio principal a partir das 9h." },
    { date: "2026-05-27", title: "Reuniao de Pais", detail: "Encontro com responsaveis as 18h30." },
    { date: "2026-06-05", title: "Simulado Bimestral", detail: "Aplicacao para turmas do 8 e 9 ano." },
  ],
};

const weekdayMap = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
const messagesEl = document.querySelector("#chatMessages");
const formEl = document.querySelector("#chatForm");
const inputEl = document.querySelector("#messageInput");
const todayMealEl = document.querySelector("#todayMeal");
const nextEventEl = document.querySelector("#nextEvent");
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
  return schoolData.meals[weekday] || "Nao ha cardapio cadastrado para hoje.";
}

function getUpcomingEvents() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return schoolData.events
    .filter((event) => new Date(`${event.date}T12:00:00`) >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
}

function findScheduleKey(question) {
  const normalized = normalizeText(question);
  return Object.keys(schoolData.schedules).find((key) => normalized.includes(normalizeText(key)));
}

function formatSchedule(className) {
  const lessons = schoolData.schedules[className];
  const lessonList = lessons.map(([time, subject]) => `${time} - ${subject}`).join("\n");
  return `Horario da turma ${className}:\n${lessonList}`;
}

function answerQuestion(question) {
  const normalized = normalizeText(question);
  const scheduleKey = findScheduleKey(question);

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

    const classes = Object.keys(schoolData.schedules).join(", ");
    return `Para consultar o horario, informe a turma. Turmas cadastradas: ${classes}.`;
  }

  if (normalized.includes("secretaria") || normalized.includes("contato") || normalized.includes("telefone")) {
    return schoolData.contacts.secretaria;
  }

  if (normalized.includes("coordenacao") || normalized.includes("coordenador")) {
    return schoolData.contacts.coordenacao;
  }

  if (normalized.includes("ajuda") || normalized.includes("ola") || normalized.includes("oi")) {
    return "Ola! Posso ajudar com horario de aulas, cardapio da merenda, eventos da escola e contato da secretaria.";
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

fillDashboard();
addMessage(
  "Assistente",
  "Ola! Eu sou o assistente da escola. Pergunte sobre horarios, merenda, eventos ou contatos.",
  "bot"
);
