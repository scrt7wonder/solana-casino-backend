"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const historyController_1 = require("../controllers/historyController");
const router = (0, express_1.Router)();
const historyController = new historyController_1.HistoryController();
// @route   POST /api/game/history
// @desc    get transaction
// @access  Public
router.post('/history', async (req, res, next) => {
    try {
        await historyController.getHistory(req, res);
    }
    catch (err) {
        next(err);
    }
});
// @route   POST /api/game/ohlc
// @desc    get transaction
// @access  Public
router.post('/ohlc', async (req, res, next) => {
    try {
        await historyController.getChartData(req, res);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
