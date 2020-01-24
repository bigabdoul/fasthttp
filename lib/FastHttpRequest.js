const {
  pathToRegexp
} = require("path-to-regexp");

const removeEnd = (s, chars) => {
  const str = "" + s;
  if (str && str.endsWith(chars))
    return str.substring(0, str.length - chars.length);
  return str;
};

/**
 * Represents a wrapper around an instance of Node's HTTP IncomingMessage.
 */
class FastHttpRequest {
  /**
   * Initialize a new instance of the FastHttpRequest class.
   * @param {object} incomingMessage An instance of Node's HTTP IncomingMessage class.
   * @param {string} routePath The route path template.
   */
  constructor(incomingMessage, routePath) {
    this._req = incomingMessage;

    const {
      url,
      headers
    } = incomingMessage;

    this._parsed = FastHttpRequest.parseUrl(headers.host, url, routePath);
    this.routePath = routePath;
  }

  /** Get the low-level Node HTTP ServerResponse. */
  get low() {
    return this._req;
  }

  /** Get the parsed request object. */
  get parsed() {
    return this._parsed;
  }

  /** Get the query property of the parsed request object. */
  get query() {
    return this._parsed.query || {};
  }

  /** Get the params property of the parsed request object. */
  get params() {
    return this._parsed.params || {};
  }

  /** Get or set the route path template for the current request. */
  get routePath() {
    return this._routePath;
  }
  set routePath(value) {
    if (this._routePath !== value) {
      this._routePath = value;

      if (value) {
        this._regexp = pathToRegexp(value);
        const {
          _parsed: p
        } = this;
        if (!p.params) p.params = FastHttpRequest.getParams(value, p.pathname);
      }
    }
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
   * Creates a new instance of the FastHttpRequest class.
   * @param {object} incomingMessage An instance of IncomingMessage.
   * @param {string} routePath The route template used to extract request parameters.
   */
  static from(incomingMessage, routePath) {
    return new FastHttpRequest(incomingMessage, routePath);
  }

  /**
   * Parses the given URL parts into an object instance.
   * @param {string} host The host name received from a request's header.
   * @param {string} path The URL of an incoming request.
   * @param {string} routePath The route template used to extract request parameters.
   * @param {string} protocol The HTTP scheme or protocol of the request.
   * @returns {object} An object representing the parsed URL.
   */
  static parseUrl(host, path, routePath, protocol) {
    const http = "http";
    const parts = host.split(":");
    const hostname = parts[0];
    const sPort = parts.length > 1 ? `:${parts[1]}` : "";

    protocol = removeEnd((protocol || http).toLowerCase(), ":");

    if (path.indexOf(http) === -1)
      path = `${protocol}://${hostname}${sPort}${path}`;

    const url = new URL(path);
    const query = url.search ?
      FastHttpRequest.parseQueryString(url.search) : {};
    let pn = url.pathname;

    if (pn && pn.length > 1) pn = removeEnd(pn, "/");

    const params = FastHttpRequest.getParams(routePath, pn);
    const secure = protocol === "https";
    const port = parseInt(url.port || (secure ? "443" : "80"));

    return {
      fullpath: url.href,
      host: url.host,
      hostname: url.hostname,
      port,
      pathname: pn,
      search: url.search,
      query,
      params
    };
  }

  /**
   * Parse the specified search string into a key-value pair collection.
   * @param {string} search The search string of a request.
   * @returns {object} A collection of key-value pairs.
   */
  static parseQueryString(search) {
    const query = {};

    if (search) {
      const usp = new URLSearchParams(search);
      const keys = usp.keys();
      const loop = true;

      while (loop) {
        const {
          done,
          value: key
        } = keys.next();
        if (done) break;
        query[key] = usp.get(key);
      }
    }

    return query;
  }

  /**
   * Extract route parameters from the specified path.
   * @param {string} routePath The route path template.
   * @param {string} path The path from which to extract route parameters.
   * @returns {object} A object containing key-value pairs of the extracted route parameters.
   */
  static getParams(routePath, path) {
    if (routePath && path) {
      const keys = [];
      const results = pathToRegexp(routePath, keys).exec(path);

      if (results) {
        const params = {};
        for (let i = 0; i < keys.length; i++) {
          const name = keys[i]["name"];
          params[name] = results[i + 1];
        }
        return params;
      }
    }
  }

  /**
   * Check if the path name matches the route path template.
   * @param {string} routePath The route path template.
   * @param {string} path The actual path name to check.
   */
  static matchPath(routePath, path) {
    return pathToRegexp(routePath).test(path);
  }
}

module.exports = FastHttpRequest;