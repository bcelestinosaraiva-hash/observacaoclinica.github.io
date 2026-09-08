export async function onRequest(context) {
    const { request, next } = context;
    const url = new URL(request.url);

    const country = request.cf?.country || '';
    const userAgent = request.headers.get('User-Agent') || '';

    const isBot = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp/i.test(userAgent);

    // só redireciona visitantes do Brasil, entrando pela raiz "/"
    if (url.pathname === '/' && !isBot) {
        if (country === 'BR') {
            return Response.redirect(`${url.origin}/br/`, 302);
        }
    }

    return next();
}