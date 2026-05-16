window.SCHOOL_DATA = {
  escola: {
    nome: "Chatbot Escolar",
    sigla: "CE",
    subtitulo: "Assistente escolar",
    saudacao:
      "Ola! Eu sou o assistente da escola. Pergunte sobre horarios, merenda, eventos, contatos ou avisos.",
  },
  contatos: {
    secretaria: "A secretaria atende de segunda a sexta, das 7h30 as 17h. Telefone: (00) 0000-0000.",
    coordenacao: "A coordenacao atende alunos no intervalo da manha e da tarde, mediante disponibilidade.",
  },
  merenda: {
    segunda: "Arroz, feijao, carne moida, salada e fruta.",
    terca: "Macarrao ao molho, frango desfiado, legumes e suco.",
    quarta: "Arroz, feijao, frango assado, salada e banana.",
    quinta: "Sopa de legumes com carne e pao.",
    sexta: "Arroz, feijao, omelete, salada e fruta.",
  },
  horarios: {
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
  eventos: [
    { date: "2026-05-20", title: "Feira de Ciencias", detail: "Apresentacoes no patio principal a partir das 9h." },
    { date: "2026-05-27", title: "Reuniao de Pais", detail: "Encontro com responsaveis as 18h30." },
    { date: "2026-06-05", title: "Simulado Bimestral", detail: "Aplicacao para turmas do 8 e 9 ano." },
  ],
  avisos: [
    "Trazer garrafa de agua todos os dias.",
    "Manter os dados de contato atualizados na secretaria.",
  ],
  respostas: [
    {
      palavras: ["uniforme", "roupa"],
      resposta: "O uso do uniforme escolar e recomendado todos os dias. Em caso de duvida, procure a secretaria.",
    },
    {
      palavras: ["biblioteca", "livro"],
      resposta: "A biblioteca funciona de segunda a sexta, nos intervalos e no contraturno.",
    },
  ],
};
