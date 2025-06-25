"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = void 0;
const errors_1 = require("../utils/errors");
const notFoundHandler = (req, res, next) => {
    const error = new errors_1.HttpException(404, `Not Found - ${req.originalUrl}`);
    next(error);
};
exports.notFoundHandler = notFoundHandler;
