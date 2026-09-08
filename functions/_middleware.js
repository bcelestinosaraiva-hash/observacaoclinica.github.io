export async function onRequest(context) {
    const { request, next } = context;
    const url = new URL(request.url);
    const pathname = url.pathname;

    const country = request.cf?.country || '';
    const userAgent = request.headers.get('User-Agent') || '';
    const isBot = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp/i.test(userAgent);

    // não mexe em arquivos estáticos, nas outras functions, nem em bots
    const isAsset = /\.(css|js|mjs|svg|png|jpg|jpeg|webp|ico|woff2?|ttf|xml|txt|json)$/i.test(pathname);
    const isApiRoute = /^\/(subscribe|unsubscribe|subscribers)/.test(pathname);

    if (isAsset || isApiRoute || isBot) {
        return next();
    }

    const isBrPath = pathname === '/br' || pathname.startsWith('/br/');

    // Brasil, mas está numa página pt-PT -> manda pra /br
    if (country === 'BR' && !isBrPath) {
        return Response.redirect(`${url.origin}/br${pathname}${url.search}`, 302);
    }

    // Fora do Brasil, mas está numa página /br -> manda pra pt-PT
    if (country !== 'BR' && isBrPath) {
        const newPath = pathname.replace(/^\/br/, '') || '/';
        return Response.redirect(`${url.origin}${newPath}${url.search}`, 302);
    }

    return next();
}