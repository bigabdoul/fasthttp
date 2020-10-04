const {
    app,
    fasthttp
} = require('./server');

describe('FastHttpStaticMiddleware', () => {

    const port = process.env.PORT || 3000;
    app.server.listen(port);
    console.log(`Server listening on http://localhost:${port}...`);

    it('should serve static files', () => {
        app.use(fasthttp.static('tests/files'));


    });
});