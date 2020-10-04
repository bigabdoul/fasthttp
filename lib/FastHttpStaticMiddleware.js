const fs = require("fs");
const path = require("path");
const url = require("url");
const FastHttpResponse = require("./FastHttpResponse");

/**
 * Represents a middleware that processes static assets.
 */
class FastHttpStaticMiddleware {
    /**
     * Initialize a new instance of the FastHttpStaticMiddleware class.
     * @param {string} root The root directory of static assets.
     * @param {object} options Optional options for processing static assets.
     */
    constructor(root, options) {
        this._root = root;
        this._options = options = getDefault(options);
        this.run = this.run.bind(this);

        // return the middleware function right here
        return this.run;
    }

    /**
     * Run the middleware by looking up a file as requested.
     * @param {object} req An instance of Node's IncomingMessage class.
     * @param {object} res An instance of Node's ServerResponse class.
     * @param {Function} next A reference to the next middleware.
     */
    run(req, res, next) {
        const pn = url.parse(req.url).pathname;
        const filename = path.join(this._root, pn);

        const done = (err, filename) => {
            if (err) {
                console.error(err);
            } else if (filename) {
                FastHttpResponse.from(res).sendFile(filename, this._options, () => {
                    if (!res.finished) res.end();
                });
            } else if (!res.finished)
                res.end();
        };

        fs.access(filename, fs.constants.F_OK | fs.constants.R_OK, err => {
            if (err) {
                done(err, null); // file does not exist or cannot be read
            } else {
                if (filename.startsWith('.')) {
                    if (this._options.dotfiles === "deny") {
                        res.statusCode = 403;
                        return next();
                    } else if (this._options.dotfiles === "ignore") {
                        res.statusCode = 404;
                        return next();
                    }
                }
                // invoke callback function
                done(null, filename);
            }
        });
    }
}

function getDefault(options) {
    return Object.assign({
        dotfiles: "ignore",
        etag: true,
        extensions: false,
        fallthrough: true,
        immutable: false,
        index: "index.html",
        lastModified: true,
        maxAge: 0,
        redirect: true,
        setHeaders: undefined
    }, options);
}

module.exports = FastHttpStaticMiddleware;