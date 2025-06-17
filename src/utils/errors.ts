export class HttpException extends Error {
    public status: number;
    public details?: any;

    constructor(status: number, message: string, details?: any) {
        super(message);
        this.status = status;
        this.details = details;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class BadRequestException extends HttpException {
    constructor(message = 'Bad Request', details?: any) {
        super(400, message, details);
    }
}

export class UnauthorizedException extends HttpException {
    constructor(message = 'Unauthorized', details?: any) {
        super(401, message, details);
    }
}

export class NotFoundException extends HttpException {
    constructor(message = 'Not Found', details?: any) {
        super(404, message, details);
    }
}

export class InternalServerErrorException extends HttpException {
    constructor(message = 'Internal Server Error', details?: any) {
        super(500, message, details);
    }
}