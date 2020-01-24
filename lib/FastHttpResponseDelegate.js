const { pathToRegexp } = require("path-to-regexp");
const FastHttpResponse = require("./FastHttpResponse");

/**
 * Represents a delegate that invokes all route handlers for a given path.
 */
class FastHttpResponseDelegate {
  /**
   * Initialize a new instance of the class with the specified parameters.
   * @param {string} routePath The route path template.
   * @param {Array<Function>} callbacks An array of one or more functions.
   */
  constructor(routePath, ...callbacks) {
    this._handlers = callbacks;
    this._routePath = routePath;
    this._regexp = pathToRegexp(routePath);
  }

  /** Get the route path template. */
  get routePath() {
    return this._routePath;
  }

  /**
   * Check whether the specified path matches the route path template.
   * @param {string} path The path to test.
   * @returns {boolean} true if path matches the route path; otherwise, false.
   */
  isMatch(path) {
    return this._regexp && this._regexp.test(path);
  }

  /**
   * Wrap an instance of FastHttpResponse around the specified ServerResponse
   * and invoke all route handlers for the specified FastHttpRequest object.
   * @param {object} fastReq An instance of the FastHttpRequest class.
   * @param {object} res An instance of Node's HTTP ServerResponse class.
   */
  invoke(fastReq, res) {
    const fastResp = new FastHttpResponse(res);
    const all = this._handlers;

    for (let i = 0; i < all.length; i++) {
      const func = all[i];
      func(fastReq, fastResp);
    }
  }

  /**
   * Create a new instance of the FastHttpResponseDelegate class using the specified parameters.
   * @param {string} routePath The route path template.
   * @param  {...any} callbacks An array of functions that handle requests to the specified path.
   */
  static create(routePath, ...callbacks) {
    return new FastHttpResponseDelegate(routePath, ...callbacks);
  }
}

module.exports = FastHttpResponseDelegate;
