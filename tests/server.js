const fasthttp = require("../index");
const app = fasthttp();

app.get("/", (req, res) => {
    const time = new Date().toLocaleTimeString();
    res.send(`Welcome on Fast Http Server v0.1!\nLocal time: ${time}`);
});

app.get("/api/courses/:id?", (req, res) => {
    if (req.params.id === undefined) {
        res.write("<h1>Available courses</h1>");
        for (let i = 0; i < 4; i++) {
            res.write(`<li>Course #${i + 1}</li>`);
        }
        res.send(`</ul>`);
    } else {
        res.json(req.parsed);
    }
});

app.notFound((req, res) => {
    res.redirect(302, "/?redirected=true");
    /*
    res.json({
        error: {
            code: 404,
            message: "This is an API server. Learn your routes, mate!"
        },
        request: req.parsed
    });
    */
});

module.exports = {
    app,
    fasthttp
};