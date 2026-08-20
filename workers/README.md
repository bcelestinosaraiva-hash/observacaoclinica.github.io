# API de comentários — deploy

## 1. Instalar o Wrangler (se ainda não tiver)
```
npm install -g wrangler
wrangler login
```

## 2. Criar o banco D1
```
wrangler d1 create observacaoclinica-comentarios
```
Copie o `database_id` que aparecer e cole no `wrangler.toml`, no campo `database_id`.

## 3. Criar a tabela
```
wrangler d1 execute observacaoclinica-comentarios --remote --file=./schema.sql
```

## 4. Configurar os segredos
```
wrangler secret put ADMIN_TOKEN
```
(escolha uma senha longa e aleatória — é o que protege o painel de moderação)

Se for usar Cloudflare Turnstile de verdade (recomendado contra spam):
```
wrangler secret put TURNSTILE_SECRET_KEY
```
E no frontend, troque o `<div id="turnstile-container">` para carregar o widget real do
Turnstile (script `https://challenges.cloudflare.com/turnstile/v0/api.js`) com sua site key.
Se você pular esse passo, a verificação de Turnstile é simplesmente ignorada (não bloqueia nada).

## 5. Publicar o Worker
```
wrangler deploy
```

Isso te dá uma URL tipo `https://observacaoclinica-comentarios.SEU-SUBDOMINIO.workers.dev`.

## 6. Ligar ao seu domínio
No painel da Cloudflare, em **Workers & Pages > seu worker > Settings > Triggers**,
adicione uma rota tipo:
```
observacaoclinica.com/api/*
```
Assim as chamadas que o frontend já faz para `/api/comments` e `/api/auth/google`
caem automaticamente neste Worker, sem precisar mudar nada no `comentarios.js`.

## 7. Moderar comentários
Abra o `moderacao.html` (incluso aqui) em qualquer navegador, cole a URL do seu
site/worker e o `ADMIN_TOKEN` que você configurou no passo 4. Dá pra aprovar ou
rejeitar cada comentário pendente com um clique.

## Rotas criadas
- `POST /api/auth/google` — valida o login (chamado automaticamente pelo frontend)
- `GET  /api/comments?slug=...` — lista comentários aprovados
- `POST /api/comments` — envia um novo comentário (fica pendente até aprovação)
- `GET  /api/admin/comments?status=pending` — lista para moderação (requer admin)
- `POST /api/admin/comments/:id/approve` — aprova
- `POST /api/admin/comments/:id/reject` — rejeita
