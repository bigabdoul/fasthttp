const isfunc = fn => typeof fn === "function";

/**
 * Represents an object used to handle middlewares.
 */
class FastHttpMiddlewareHandler {
    /**
     * Initialize a new instance of the FastHttpMiddlewareHandler class.
     */
    constructor() {
        this._middlewares = [];
    }

    /** Get the length of stored middlewares. */
    get count() {
        return this._middlewares.length;
    }

    /**
     * Create a new instance of the FastHttpMiddlewareHandler class.
     */
    static create() {
        return new FastHttpMiddlewareHandler();
    }

    /**
     * Add one or more middlewares to the handler.
     * @param {Function|Array<Function>} middlewares A function
     * or array of functions representing middlewares to use.
     */
    use(middlewares) {
        const {
            _middlewares: wares
        } = this;

        if (isfunc(middlewares)) wares.push(middlewares);
        else if (middlewares instanceof Array) {
            const funcs = middlewares.filter(f => isfunc(f));
            for (let i = 0; i < funcs.length; i++) wares.push(funcs[i]);
        } else
            throw new Error("Argument must be a function or an array of functions.");
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
        } = this._middlewares;

        if (length > 0) {
            console.debug("Creating middleware iterator...");
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
        if (index < this._middlewares.length) {
            return this._middlewares[index];
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
        this.next = this.next.bind(this);
    }

    exec() {
        this._nextIndex = -1;

        this.next();

        // success only if all middlewares were executed.
        return this._nextIndex + 1;
    }

    next() {
        const {
            _parent,
            _req,
            _res,
            next,
            _nextIndex: idx
        } = this;

        const func = _parent._getnext(idx + 1);

        if (isfunc(func)) {
            console.debug("Calling next middleware...");
            this._nextIndex++;
            func.call(_parent, _req, _res, next);
        }
    }
}

module.exports = FastHttpMiddlewareHandler;