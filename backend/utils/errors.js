class GeneralError extends Error {
    constructor(message) {
        super();
        this.message = message;
    }

    getCode() {
        return 500;
    }
}

class BadRequest extends GeneralError {
    getCode() {
        return 400;
    }
}

class NotFound extends GeneralError {
    getCode() {
        return 404;
    }
}

module.exports = {
    GeneralError,
    BadRequest,
    NotFound
};