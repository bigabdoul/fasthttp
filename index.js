const http = require("http");
const FastHttpRouteHandler = require("./lib/FastHttpRouteHandler");
const FastHttpMiddlewareHandler = require("./lib/FastHttpMiddlewareHandler");

/**
 * A simple wrapper around a Node HTTP Server.
 */
class FastHttpServer {
  /**
   * Initialize a new instance of the FastHttpServer class.
   */
  constructor() {
    this._router = FastHttpRouteHandler.create();
    this._mwhandler = FastHttpMiddlewareHandler.create();
    this._handleRequest = this._handleRequest.bind(this);
    this._passThrough = this._passThrough.bind(this);
    this.server = http.createServer(this._handleRequest);
  }

  /** Get the router. */
  get router() {
    return this._router;
  }

  /**
   * Add a middleware or a one-dimensional array of middlewares.
   * @param {Function|Array<Function>} fn A function or an array of functions to add.
   */
  use(fn) {
    this._mwhandler.use(fn);
    return this;
  }

  /**
   * Add one or more GET request handlers for the specified path.
   * @param {string} routePath The route path template.
   * @param  {...any} callbacks One or more request handlers.
   */
  get(routePath, ...callbacks) {
    this._router.get(routePath, ...callbacks);
  }

  /**
   * Add one or more POST request handlers for the specified path.
   * @param {string} routePath The route path template.
   * @param  {...any} callbacks One or more request handlers.
   */
  post(routePath, ...callbacks) {
    this._router.post(routePath, ...callbacks);
  }


  /**
   * Add one or more PUT request handlers for the specified path.
   * @param {string} routePath The route path template.
   * @param  {...any} callbacks One or more request handlers.
   */
  put(routePath, ...callbacks) {
    this._router.put(routePath, ...callbacks);
  }


  /**
   * Add one or more DELETE request handlers for the specified path.
   * @param {string} routePath The route path template.
   * @param  {...any} callbacks One or more request handlers.
   */
  delete(routePath, ...callbacks) {
    this._router.delete(routePath, ...callbacks);
  }

  /**
   * Add one or more PATCH request handlers for the specified path.
   * @param {string} routePath The route path template.
   * @param  {...any} callbacks One or more request handlers.
   */
  patch(routePath, ...callbacks) {
    this._router.patch(routePath, ...callbacks);
  }

  /**
   * Add one or more HEAD request handlers for the specified path.
   * @param {string} routePath The route path template.
   * @param  {...any} callbacks One or more request handlers.
   */
  head(routePath, ...callbacks) {
    this._router.head(routePath, ...callbacks);
  }


  /**
   * Add one or more OPTIONS request handlers for the specified path.
   * @param {string} routePath The route path template.
   * @param  {...any} callbacks One or more request handlers.
   */
  options(routePath, ...callbacks) {
    this._router.options(routePath, ...callbacks);
  }

  /**
   * Add a 404 (page not found) error handler.
   * @param {Function} callback A function to invoke.
   */
  notFound(callback) {
    this._router.notFound(callback);
  }

  /**
   * Add one or more request handlers for the given HTTP method and route path.
   * @param {string} method The HTTP verb to add a handler for.
   * @param {string} routePath The route path template.
   * @param {...any} callbacks One or more request handlers.
   * @returns {object} An instance of the FastHttpResponseDelegate class.
   */
  route(method, routePath, ...callbacks) {
    return this._router.add(method, routePath, ...callbacks);
  }

  // Expose underlying server methods for convenience

  /*
  listen(port?: number, hostname?: string, backlog?: number, listeningListener?: () => void): this;
  listen(port?: number, hostname?: string, listeningListener?: () => void): this;
  listen(port?: number, backlog?: number, listeningListener?: () => void): this;
  listen(port?: number, listeningListener?: () => void): this;
  listen(path: string, backlog?: number, listeningListener?: () => void): this;
  listen(path: string, listeningListener?: () => void): this;
  listen(options: ListenOptions, listeningListener?: () => void): this;
  listen(handle: any, backlog?: number, listeningListener?: () => void): this;
  listen(handle: any, listeningListener?: () => void): this;
  close(callback?: (err?: Error) => void): this;
  address(): AddressInfo | string | null;
  getConnections(cb: (error: Error | null, count: number) => void): void;
  */

  _handleRequest(req, res) {
    this._mwhandler.run(req, res, this._passThrough, count => {
      console.warn(
        `Only ${count}/${this._mwhandler.count} middleware.s was/were run.`
      );
      // make sure the request doesn't end up hanging.
      if (!res.finished) res.end();
    });
  }

  _passThrough(req, res) {
    const {
      method,
      url
    } = req;
    console.log(`${method}: ${url}`);
    this._router.invoke(req, res);
  }
}

const fasthttp = () => new FastHttpServer();
exports = module.exports = fasthttp;
exports.Router = () => FastHttpRouteHandler.create(http.METHODS);