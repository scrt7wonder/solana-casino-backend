"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const roundController_1 = require("../controllers/roundController");
const router = (0, express_1.Router)();
const roundController = new roundController_1.RoundController();
// @route   GET /api/round/winner/:round
// @desc    get winner
// @access  Public
router.get('/winner/:round', async (req, res, next) => {
    try {
        await roundController.getWinner(req, res);
    }
    catch (err) {
        next(err);
    }
});
// @route   GET /api/round/luck
// @desc    get winner
// @access  Public
router.get('/luck', async (req, res, next) => {
    try {
        await roundController.getLuck(req, res);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
