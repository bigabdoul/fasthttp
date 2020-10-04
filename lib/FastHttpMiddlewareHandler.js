const FastHttpStaticMiddleware = require("./FastHttpStaticMiddleware");

const isfunc = fn => typeof fn === "function";
const is_static = fn => fn instanceof FastHttpStaticMiddleware;

/**
 * Return all instances of the FastHttpStaticMiddleware class and regular functions.
 * @param {Function|Array<Function>} args One or more 
 * FastHttpStaticMiddleware instances or functions.
 */
const get_middlewares = args => {
    const result = [];

    if (isfunc(args) || is_static(args))
        result.push(args);
    else if (args instanceof Array) {
        for (let i = 0; i < args.length; i++) {
            const fn = args[i];
            if (isfunc(fn) || is_static(fn)) result.push(fn)
        }
    }

    return result;
};

/**
 * Represents an object used to handle middlewares.
 */
class FastHttpMiddlewareHandler {
    /**
     * Initialize a new instance of the FastHttpMiddlewareHandler class.
     */
    constructor() {
        this._middles = [];
    }

    /** Get the length of stored middlewares. */
    get count() {
        return this._middles.length;
    }

    /**
     * Create a new instance of the FastHttpMiddlewareHandler class.
     */
    static create() {
        return new FastHttpMiddlewareHandler();
    }

    /**
     * Add one or more middlewares to the handler.
     * @param {Function|Array<Function>} args A function
     * or array of functions representing middlewares to use.
     */
    use(args) {
        const result = get_middlewares(args);
        result.forEach(n => this._middles.push(n));
    }

    /**
     * Run all registered middlewares.
     * @param {object} req An instance of Node's IncomingMessage class.
     * @param {object} res An instance of Node's HTTP ServerResponse class.
     * @param {Function} done A callback function to invoke when all middlewares were run.
     * @param {Function} failed Optional: A callback function to invoke if not all
     * middlewares were run.
     */
    run(req, res, done, failed) {
        const {
            length
        } = this._middles;

        if (length > 0) {
            console.debug("Creating iterator...");
            const result = this._create(req, res).exec();
            console.debug(`Number of middlewares executed: ${result}/${length}`);

            if (length !== result) {
                if (isfunc(failed)) failed(result);
                return;
            }
        }

        console.debug("Done executing middlewares!");
        done(req, res);
    }

    _create(req, res) {
        return new FastHttpMiddlewareIterator(this, req, res);
    }

    _getnext(index) {
        const wares = this._middles;
        if (index < wares.length) {
            return wares[index];
        }
        return false;
    }
}

class FastHttpMiddlewareIterator {
    constructor(parent, req, res) {
        this._parent = parent; // FastHttpMiddlewareHandler
        this._nextIndex = -1;
        this._req = req;
        this._res = res;
        this.next = this._next.bind(this);
    }

    exec() {
        this._nextIndex = -1;

        this._next();

        // success only if all middlewares were executed.
        return this._nextIndex + 1;
    }

    _next() {
        const {
            _parent,
            _req,
            _res,
            _next,
            _nextIndex
        } = this;

        const func = _parent._getnext(_nextIndex + 1);

        if (func) {
            console.debug("Calling next middleware...");
            this._nextIndex++;

            if (is_static(func)) {
                // execute static middleware
                func.run(_req, _res, _next);
            } else {
                func.call(_parent, _req, _res, _next);
            }
        }
    }
}

module.exports = FastHttpMiddlewareHandler;