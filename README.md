# Djoola Fast HTTP

`djoola-fasthttp` is an alternative, light-weight express-like library based on Node's http module. This is an early attempt towards building a fast, reliable, simple yet powerful HTTP library.

```JavaScript
const fasthttp = require("djoola-fasthttp");
const app = fasthttp();

app.get("/", (req, res) => {
  const time = new Date().toLocaleTimeString();
  res.send(`Welcome on Fast Http Server v0.1!\nLocal time: ${time}`);
});

const port = process.env.PORT || 3000;
app.server.listen(port);
console.log(`Listening on http://localhost:${port}...`);
```

## Installation

This is a Node.js module available through the npm registry.

Before installing, download and install Node.js. It was built with Node.js v12.14.1 but earlier versions might be able to run it.

Installation is done using the npm install command:

```
$ npm install djoola-fasthttp
```

## Features

- Robust routing using path-to-regexp.
- Focus on high performance
- HTTP helpers (redirection, caching, etc)
- Many more to come

## Quick Start

Create the project folder structure:

```
$ mkdir myapp && cd myapp
$ mkdir src && cd src
```

Install dependencies:

```
$ npm init --yes
$ npm install djoola-fasthttp
```

Under the `src` folder, create a file named `main.js` and paste the following into it:

```JavaScript
const fasthttp = require("djoola-fasthttp");
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
  res.json({
    error: {
      code: 404,
      message: "This is an API server. Learn your routes, mate!"
    },
    request: req.parsed
  });
});

const port = process.env.PORT || 3000;
app.server.listen(port);
console.log(`Server listening on http://localhost:${port}...`);
```

From the current _src_ folder, run:

```
$ node main.js
```

Navigate to `http://localhost:3000/` or `http://locahost:3000/api/courses`. You might have to change _3000_ to whatever port number the server is listening on.

## Using middlewares

```JavaScript
const fasthttp = require("djoola-fasthttp");
const app = fasthttp();

const firstMiddle = (req, res, next) => {
    console.log("First middleware invoked.");
    req.locals.data = 'Data from middleware #1';
    next(); // call next() to invoke the next middleware
};

app.use(firstMiddle);

// second inline middleware
app.use((req, res, next) => {
    console.log("Second middleware invoked.");
    console.log('data from previous middleware:', req.locals.data);
    next();
});

app.get("/", (req, res) => {
  const time = new Date().toLocaleTimeString();
  res.send(`Welcome on Fast Http Server v0.1!\nLocal time: ${time}`);
});

const port = process.env.PORT || 3000;
app.server.listen(port);
console.log(`Server listening on http://localhost:${port}...`);
```

Unlike other middleware handlers, `djoola-fasthttp`'s middleware handler makes sure there are no hanging requests. For instance, in the second middleware above, if you forget to call `next()` and also happen to forget to respond to the client, `djoola-fasthttp`'s middleware handler takes care of ending the response process.
