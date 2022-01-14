class HttpError extends Error {
  constructor(message, errorCode) {
    super(message);
    this.code = errorCode; //add code property
  }
}
module.exports = HttpError;
