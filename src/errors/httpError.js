// Custom error to be used in services and routes
class HttpError extends Error {
  constructor(status = 500, message = 'Internal server error') {
    super(message)
    this.status = status
  }
}

module.exports = HttpError
