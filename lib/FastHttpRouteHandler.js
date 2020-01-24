const FastHttpRequest = require("./FastHttpRequest");
const FastHttpResponse = require("./FastHttpResponse");
const FastHttpResponseDelegate = require("./FastHttpResponseDelegate");

const throwMethodNotSupported = m => {
    throw new Error(`Method '${m}' not supported.`);
}

/**
 * Manages route handlers.
 */
class FastHttpRouteHandler {
    /**
     * Initialize a new instance of the class.
     * @param {string[] | undefined | null} supportedHttpMethods Optional: An array
     * of supported HTTP method names. If undefined or null, only basic HTTP methods 
     * ('GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH') will be supported.
     */
    constructor(supportedHttpMethods) {
        // dictionary of supported request handlers
        this._delegates = {};
        this._notfoundHandler = null;

        if (supportedHttpMethods instanceof Array)
            this._httpMethods = supportedHttpMethods;
        else
            this._httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH', ];
    }

    /**
     * Create a new instance of the class.
     * @param {string[] | undefined | null} supportedHttpMethods Optional: An array
     * of supported HTTP method names. If undefined or null, only basic HTTP methods 
     * ('GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH') will be supported.
     */
    static create(supportedHttpMethods) {
        return new FastHttpRouteHandler(supportedHttpMethods);
    }

    /** Get the HTTP methods supported by this handler. */
    get supportedHttpMethods() {
        return this._httpMethods;
    }

    /**
     * Add one or more GET request handlers for the specified path.
     * @param {string} routePath The route path template.
     * @param  {...any} callbacks One or more request handlers.
     */
    get(routePath, ...callbacks) {
        this.add("GET", routePath, ...callbacks);
    }

    /**
     * Add one or more POST request handlers for the specified path.
     * @param {string} routePath The route path template.
     * @param  {...any} callbacks One or more request handlers.
     */
    post(routePath, ...callbacks) {
        this.add("POST", routePath, ...callbacks);
    }

    /**
     * Add one or more PUT request handlers for the specified path.
     * @param {string} routePath The route path template.
     * @param  {...any} callbacks One or more request handlers.
     */
    put(routePath, ...callbacks) {
        this.add("PUT", routePath, ...callbacks);
    }

    /**
     * Add one or more DELETE request handlers for the specified path.
     * @param {string} routePath The route path template.
     * @param  {...any} callbacks One or more request handlers.
     */
    delete(routePath, ...callbacks) {
        this.add("DELETE", routePath, ...callbacks);
    }

    /**
     * Add one or more PATCH request handlers for the specified path.
     * @param {string} routePath The route path template.
     * @param  {...any} callbacks One or more request handlers.
     */
    patch(routePath, ...callbacks) {
        this.add("PATCH", routePath, ...callbacks);
    }

    /**
     * Add one or more HEAD request handlers for the specified path.
     * @param {string} routePath The route path template.
     * @param  {...any} callbacks One or more request handlers.
     */
    head(routePath, ...callbacks) {
        this.add("HEAD", routePath, ...callbacks);
    }

    /**
     * Add one or more OPTIONS request handlers for the specified path.
     * @param {string} routePath The route path template.
     * @param  {...any} callbacks One or more request handlers.
     */
    options(routePath, ...callbacks) {
        this.add("OPTIONS", routePath, ...callbacks);
    }

    /**
     * Add one or more request handlers for the given HTTP method and specified path.
     * @param {string} method The HTTP verb to add.
     * @param {string} routePath The route path template.
     * @param  {...any} callbacks One or more request handlers.
     * @returns {object} An instance of FastHttpResponseDelegate 
     * or throws an error if the method is not supported.
     */
    add(method, routePath, ...callbacks) {
        /* Supported HTTP methods within Node (v12.14.1)
        'ACL',         'BIND',       'CHECKOUT',
        'CONNECT',     'COPY',       'DELETE',
        'GET',         'HEAD',       'LINK',
        'LOCK',        'M-SEARCH',   'MERGE',
        'MKACTIVITY',  'MKCALENDAR', 'MKCOL',
        'MOVE',        'NOTIFY',     'OPTIONS',
        'PATCH',       'POST',       'PROPFIND',
        'PROPPATCH',   'PURGE',      'PUT',
        'REBIND',      'REPORT',     'SEARCH',
        'SOURCE',      'SUBSCRIBE',  'TRACE',
        'UNBIND',      'UNLINK',     'UNLOCK',
        'UNSUBSCRIBE'
        */
        const delegates = this._getDelegates(method);

        if (delegates instanceof Array) {
            const delg = FastHttpResponseDelegate.create(routePath, ...callbacks);
            delegates.push(delg);
            return delg;
        } else
            throwMethodNotSupported(method);
    }

    /**
     * Remove specified HTTP method handler for the given route path.
     * @param {string} method The HTTP method to remove.
     * @param {string} routePath The route path template to find.
     * @returns {boolean} true if the method and route is removed; otherwise, false.
     */
    remove(method, routePath) {
        const delegates = this._getDelegates(method);
        if (delegates instanceof Array) {
            for (let i = 0; i < delegates.length; i++) {
                if (delegates[i].routePath === routePath) {
                    delegates.splice(i, 1);
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Set the 404 error (page not found) handler.
     * @param {Function} handler A callback function that handles 404 errors.
     */
    notFound(handler) {
        this._notfoundHandler = handler;
    }

    /**
     * Invoke the FastHttpResponseDelegate in charge of the specified request.
     * @param {object} req An instance of Node's HTTP IncomingMessage.
     * @param {object} res An instance of Node's HTTP ServerResponse.
     * @returns {boolean} true if the method is invoked; otherwise, false.
     */
    invoke(req, res) {
        const {
            handler, // FastHttpResponseDelegate
            request // FastHttpRequest
        } = this.find(req);

        if (handler) {
            // invoke the request handler
            handler.invoke(request, res);
            return true;
        } else {
            this._handleNotFound(request, res);
        }

        return false;
    }

    /**
     * Find the FastHttpResponseDelegate in charge of the specified request.
     * @param {object} req An instance of Node's HTTP IncomingMessage.
     * @returns {object} An object with properties 'handler' and 'request'
     * respectively of types FastHttpResponseDelegate and FastHttpRequest.
     */
    find(req) {
        let handler = null; // FastHttpResponseDelegate
        const request = FastHttpRequest.from(req);
        const delegates = this._delegates[req.method];

        if (delegates instanceof Array) {
            const {
                pathname
            } = request.parsed;

            for (let i = 0; i < delegates.length; i++) {
                const h = delegates[i];
                if (h.isMatch(pathname)) {
                    handler = h;
                    request.routePath = h.routePath;
                    break;
                }
            }
        }
        return {
            handler,
            request
        };
    }

    _getDelegates(method, throwWhenNotSupported) {
        const m = method.toUpperCase();

        if (this._httpMethods.indexOf(m) === -1) {
            if (throwWhenNotSupported)
                throwMethodNotSupported(m);
            return undefined;
        }

        const d = this._delegates;
        if (!(m in d)) d[m] = [];

        return d[m];
    }

    _handleNotFound(fastReq, res) {
        const msg = "404: Not found";
        console.error(msg);

        const {
            _notfoundHandler: handler
        } = this;

        res.statusCode = 404;

        if (typeof handler === "function") {
            handler.call(this, fastReq, new FastHttpResponse(res))
        } else {
            res.end(msg);
        }
    }
}

module.exports = FastHttpRouteHandler;