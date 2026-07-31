# Setup — Web Push para observacaoclinica.com

## 1. Gerar as chaves VAPID (uma vez só)

```bash
npx web-push generate-vapid-keys --json
```

Guarda o `publicKey` e o `privateKey` que aparecem. Vais usar:
- `publicKey` → em `public/js/push-subscribe.js` (VAPID_PUBLIC_KEY) — pode ficar exposto no frontend, é público por natureza
- `privateKey` → só no `.env` do script Node, nunca no site nem no git

## 2. Criar a KV namespace no Cloudflare

```bash
cd worker
npx wrangler kv namespace create SUBSCRIBERS
```

Copia o `id` devolvido para `wrangler.toml` (campo `id` dentro de `kv_namespaces`).

## 3. Definir o segredo de administração

Escolhe uma string aleatória longa (ex: gera com `openssl rand -hex 32`) e define-a no Worker:

```bash
npx wrangler secret put ADMIN_SECRET
```

Cola o mesmo valor no `.env` do script Node como `PUSH_ADMIN_SECRET`.

## 4. Publicar o Worker

```bash
npx wrangler deploy
```

Depois, no Cloudflare Dashboard: Workers & Pages → o teu worker (`observacaoclinica-push`) → Settings → Domains & Routes → **Add Custom Domain** → `push.observacaoclinica.com`.

## 5. Adicionar os ficheiros ao site

- Copia `public/sw.js` para a raiz do site (ou junta os dois listeners se já tiveres um `sw.js`)
- Copia `public/js/push-subscribe.js` para o site, edita `VAPID_PUBLIC_KEY` com a chave pública gerada no passo 1
- Inclui o script em todas as páginas HTML, antes de `</body>`:
  ```html
  <script src="/js/push-subscribe.js"></script>
  ```
- Adiciona uns ícones em `/icons/icon-192.png` e `/icons/badge-72.png` (podes reaproveitar o logo/favicon do site)
- Estilo mínimo sugerido para a barra de subscrição (ajusta ao teu design):
  ```css
  #push-prompt {
    position: fixed; bottom: 16px; left: 16px; right: 16px;
    max-width: 420px; margin: 0 auto; background: #1a1a1a; color: #fff;
    padding: 12px 16px; border-radius: 8px; display: flex; gap: 8px;
    align-items: center; justify-content: space-between; z-index: 9999;
  }
  #push-prompt button { border: none; border-radius: 4px; padding: 6px 12px; cursor: pointer; }
  ```

## 6. Configurar o script de envio

```bash
npm install web-push dotenv
```

Cria um `.env` na raiz do projeto (**não faças commit deste ficheiro** — adiciona `.env` ao `.gitignore`):

```
VAPID_PUBLIC_KEY=cola_aqui_a_chave_publica
VAPID_PRIVATE_KEY=cola_aqui_a_chave_privada
VAPID_SUBJECT=mailto:suporte@observacaoclinica.com
PUSH_ENDPOINT=https://push.observacaoclinica.com
PUSH_ADMIN_SECRET=o_mesmo_segredo_do_passo_3
```

## 7. Integrar no fluxo de publicação (sitemap.js)

No teu `src/sitemap.js`, onde já detetas os URLs **novos** para o IndexNow (importante: só os novos, não os alterados — não queres notificar em cada edição), adiciona:

```js
import { notifyNewArticles } from "./push-notify.js"; // ajusta o caminho conforme a tua estrutura

// depois de identificares os URLs novos, com o título de cada artigo:
await notifyNewArticles(newArticles); // newArticles = [{ title: "...", url: "https://..." }]
```

O fluxo continua a ser: `node src/sitemap.js` → gera sitemap, notifica IndexNow, **e agora também envia os pushes** → depois `git add/commit/push`.

## Testar

1. Faz deploy do Worker e publica o site com o `push-subscribe.js` incluído
2. Abre o site num browser, aceita a notificação na barra que aparece
3. Confirma no Cloudflare Dashboard (KV → SUBSCRIBERS) que a subscrição foi guardada
4. Corre manualmente:
   ```js
   import { notifyNewArticles } from "./scripts/push-notify.js";
   await notifyNewArticles([{ title: "Artigo de teste", url: "https://observacaoclinica.com/" }]);
   ```
5. Deves receber a notificação no browser (mesmo com o separador fechado, desde que o browser esteja aberto)

## Nota

Notificações push funcionam em Chrome, Firefox e Edge em desktop/Android. No iOS só funcionam se o site for "adicionado ao ecrã principal" como PWA (limitação da Apple, não tua).
