"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerErrorException = exports.NotFoundException = exports.UnauthorizedException = exports.BadRequestException = exports.HttpException = void 0;
class HttpException extends Error {
    constructor(status, message, details) {
        super(message);
        this.status = status;
        this.details = details;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.HttpException = HttpException;
class BadRequestException extends HttpException {
    constructor(message = 'Bad Request', details) {
        super(400, message, details);
    }
}
exports.BadRequestException = BadRequestException;
class UnauthorizedException extends HttpException {
    constructor(message = 'Unauthorized', details) {
        super(401, message, details);
    }
}
exports.UnauthorizedException = UnauthorizedException;
class NotFoundException extends HttpException {
    constructor(message = 'Not Found', details) {
        super(404, message, details);
    }
}
exports.NotFoundException = NotFoundException;
class InternalServerErrorException extends HttpException {
    constructor(message = 'Internal Server Error', details) {
        super(500, message, details);
    }
}
exports.InternalServerErrorException = InternalServerErrorException;
