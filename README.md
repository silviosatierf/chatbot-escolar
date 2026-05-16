# Chatbot Escolar

Este projeto tem uma interface de chat para alunos e pode consultar um Webhook do n8n.

## Rodar com Docker

1. Copie `.env.example` para `.env`.
2. Ajuste `N8N_WEBHOOK_URL` se o seu Webhook tiver outro caminho.
3. Rode:

```bash
docker compose up --build
```

Depois acesse:

- Chatbot: http://localhost:4173
- n8n: http://localhost:5678

## Instalar como aplicativo

Depois de publicar o chatbot em um endereco HTTPS, os alunos podem instalar como app:

- Android/Chrome: abrir o link, tocar no menu do navegador e escolher `Adicionar a tela inicial` ou `Instalar app`.
- iPhone/Safari: abrir o link, tocar em compartilhar e escolher `Adicionar a Tela de Inicio`.

Em `localhost` a instalacao pode aparecer para testes, mas para uso externo o ideal e publicar em HTTPS.

## Workflow esperado no n8n

Crie um workflow com:

1. Webhook
   - Metodo: `POST`
   - Path: `chatbot-escolar`
2. Sua logica de resposta
   - Pode consultar Google Sheets, banco de dados ou IA.
3. Respond to Webhook
   - Retorne JSON neste formato:

```json
{
  "resposta": "Texto que aparecera para o aluno."
}
```

Se o n8n estiver desligado ou sem URL configurada, o chatbot continua respondendo com os dados locais do arquivo `dados-escola.js`.

## Personalizar dados e respostas

Edite o arquivo `dados-escola.js`.

Para trocar nome e saudacao:

```js
escola: {
  nome: "Nome da Escola",
  sigla: "NE",
  subtitulo: "Assistente escolar",
  saudacao: "Ola! Como posso ajudar?"
}
```

Para trocar merenda:

```js
merenda: {
  segunda: "Arroz, feijao e frango.",
  terca: "Macarrao e salada."
}
```

Para adicionar resposta personalizada:

```js
{
  palavras: ["uniforme", "roupa"],
  resposta: "O uniforme deve ser usado todos os dias."
}
```

Para publicar as alteracoes, envie o arquivo alterado para o GitHub. O Render fara um novo deploy automaticamente se o auto deploy estiver ativo.
