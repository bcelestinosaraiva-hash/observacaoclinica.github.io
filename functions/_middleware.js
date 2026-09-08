export async function onRequest(context) {
    const { request, next } = context;
    const url = new URL(request.url);
    const pathname = url.pathname;

    const country = request.cf?.country || '';
    const userAgent = request.headers.get('User-Agent') || '';
    const isBot = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp/i.test(userAgent);

    // já está em /br/ -> não faz nada
    const isBrPath = pathname === '/br' || pathname.startsWith('/br/');

    // não mexe em arquivos estáticos (imagens, css, js, etc)
    const isAsset = /\.(css|js|mjs|svg|png|jpg|jpeg|webp|ico|woff2?|ttf|xml|txt|json)$/i.test(pathname);

    // não mexe nas outras functions que já existem (newsletter)
    const isApiRoute = /^\/(subscribe|unsubscribe|subscribers)/.test(pathname);

    if (!isBrPath && !isAsset && !isApiRoute && !isBot && country === 'BR') {
        return Response.redirect(`${url.origin}/br${pathname}${url.search}`, 302);
    }

    return next();
}