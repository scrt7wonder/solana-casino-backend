"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("../controllers/auth");
const auth_2 = require("../middlewares/auth");
const router = (0, express_1.Router)();
const authController = new auth_1.AuthController();
// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', [
    (0, express_validator_1.check)('username', 'Username is required').not().isEmpty(),
    (0, express_validator_1.check)('address', 'Address is required').not().isEmpty(),
    (0, express_validator_1.check)('email', 'Email is required').not().isEmpty(),
], async (req, res, next) => {
    try {
        await authController.auth(req, res);
    }
    catch (err) {
        next(err);
    }
});
// @route   GET /api/auth/check/:address
// @desc    check user
// @access  Public
router.get('/check/:address', [
    (0, express_validator_1.check)('address', 'Address is required').not().isEmpty(),
], async (req, res, next) => {
    try {
        await authController.check(req, res);
    }
    catch (err) {
        next(err);
    }
});
// @route   GET /api/auth/user
// @desc    Get current user
// @access  Private
router.get('/user', async (req, res, next) => { await (0, auth_2.authMiddleware)(req, res, next); }, async (req, res, next) => {
    try {
        await authController.getCurrentUser(req, res);
        return;
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
