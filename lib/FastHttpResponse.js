const notImplemented = new Error("Method not implemented.");
const badArguments = new TypeError("Bad arguments.");
const badStatusRange = new RangeError(
  "Status must be between 300 and 399 inclusive."
);

/**
 * Represents a wrapper around an instance of Node's HTTP ServerResponse.
 */
class FastHttpResponse {
  /**
   * Initialize a new instance of the FastHttpResponse class.
   * @param {object} serverResponse An instance of Node's ServerResponse class.
   */
  constructor(serverResponse) {
    this._res = serverResponse;
  }

  /** Get the low-level Node HTTP ServerResponse. */
  get low() {
    return this._res;
  }

  /**
   * Set the status code.
   * @param {number} code The status code to set.
   * @returns {object} A reference to this instance.
   */
  status(code) {
    this._res.statusCode = code;
    return this;
  }

  /**
   * Write data to the underlying server response.
   * @param {any} data The data to write to the response.
   * @returns {object} A reference to this instance.
   */
  write(data) {
    this._res.write(this._getdata(data));
    return this;
  }

  /**
   * Write a value to the specified header name.
   * @param {string} name The header name to write.
   * @param {string} value The header value to write.
   * @returns {object} A reference to this instance.
   */
  writeHeader(name, value) {
    this._res.setHeader(name, value);
    return this;
  }

  /**
   * Send a JSON response.
   * @param {any} data The data to send as JSON.
   */
  json(data) {
    (data === undefined || data === null) && (data = {});
    this._res.end(JSON.stringify(data));
  }

  /**
   * NOT IMPLEMENTED: Send a JSON response with JSONP support.
   * @param {any} data The data to send.
   */
  jsonp(data) {
    console.debug("jsonp not implemented", data);
    throw notImplemented;
  }

  /**
   * NOT IMPLEMENTED: Send a response of various types.
   * @param {any} data The data to send.
   */
  send(data) {
    this._res.end(this._getdata(data));
  }

  /**
   * NOT IMPLEMENTED: Send a file as an octet stream.
   * @param {string} path The fully-qualified path to the file to send.
   * @param {object} options Options.
   * @param {Function} callback A callback function.
   */
  sendFile(path, options, callback) {
    console.debug("sendFile not implemented", path, options, callback);

    /* options = {
                root: path.join(__dirname, 'public'),
                dotfiles: 'deny',
                headers: {
                'x-timestamp': Date.now(),
                'x-sent': true
            }
        } */
    throw notImplemented;
  }

  /**
   * Sets the response HTTP status code to statusCode and
   * send its string representation as the response body.
   * @param {number} code The status code to send.
   */
  sendStatus(code) {
    this.status(code).send(`${code}`);
  }

  /**
   * NOT IMPLEMENTED: Prompt a file to be downloaded.
   * @param {string} path The path to the file to download.
   * @param {string} filename The download name of the file.
   * @param {object} options Options.
   * @param {Function} callback A callback function.
   */
  download(path, filename, options, callback) {
    console.debug(
      "download not implemented",
      path,
      filename,
      options,
      callback
    );
    throw notImplemented;
  }

  /**
   * NOT IMPLEMENTED: Redirect a request.
   * @param {number|string} status The status code to set. If not a number, the path.
   * @param {string} path The relative or fully-qualified URL to redirect to.
   */
  redirect(status, path) {
    let code;
    if (arguments.length === 1) {
      if (typeof status !== "string" || status.length === 0) throw badArguments;
      path = status;
      code = 302;
    } else if (arguments.length === 2) {
      if (typeof status === "number" && typeof path === "string") {
        code = parseInt(status);
        if (code < 300 || code > 399) throw badStatusRange;
      } else throw badArguments;
    } else throw badArguments;

    this.status(code)
      .writeHeader("Location", path)
      .end();
  }

  /**
   * NOT IMPLEMENTED: Render a view template.
   * @param {string} view The path to the view to render.
   * @param {any} context The local variables to pass to the view.
   * @param {Function} callback A callback function to invoke after rendering the view.
   */
  render(view, context, callback) {
    console.debug("render not implemented", view, context, callback);
    throw notImplemented;
  }

  /**
   * End the response process.
   * @param {any} data The data to end the response process with.
   */
  end(data) {
    if (data === undefined || data === null) this._res.end();
    else this._res.end(this._getdata(data));
  }

  /**
   * Creates a new instance of the FastHttpResponse class.
   * @param {object} serverResponse An instance of Node's HTTP ServerResponse class.
   */
  static from(serverResponse) {
    return new FastHttpResponse(serverResponse);
  }

  _getdata(data) {
    if (data === undefined || data === null) return "";
    else if (typeof data === "object") {
      try {
        return JSON.stringify(data);
      } catch (e) {
        console.debug("Cannot convert object to JSON.", e, data);
      }
    }
    return data;
  }
}

module.exports = FastHttpResponse;
