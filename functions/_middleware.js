export async function onRequest(context) {
    const url = new URL(context.request.url);

    if (url.hostname === 'observacaoclinica.pages.dev') {
        return Response.redirect(
            'https://observacaoclinica.com' + url.pathname + url.search,
            301
        );
    }

    return context.next();
}