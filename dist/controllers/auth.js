"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const express_validator_1 = require("express-validator");
const authService_1 = require("../services/authService");
class AuthController {
    constructor() {
        this.auth = async (req, res) => {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            try {
                const userData = req.body;
                console.log("🚀 ~ AuthController ~ auth= ~ userData:", userData);
                const user = await this.authService.auth(userData);
                return res.status(201).json(user);
            }
            catch (error) {
                return res.status(400).json({ message: error.message });
            }
        };
        this.check = async (req, res) => {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            try {
                const { address } = req.params;
                const user = await this.authService.check(address);
                return res.status(201).json(user);
            }
            catch (error) {
                return res.status(400).json({ message: error.message });
            }
        };
        this.getCurrentUser = async (req, res) => {
            try {
                const user = req.user;
                return res.json(user);
            }
            catch (error) {
                return res.status(500).json({ message: 'Server error' });
            }
        };
        this.authService = new authService_1.AuthService();
    }
}
exports.AuthController = AuthController;
