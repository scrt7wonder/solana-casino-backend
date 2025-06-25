"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoryController = void 0;
const historyService_1 = require("../services/historyService");
class HistoryController {
    constructor() {
        this.getHistory = async (req, res) => {
            try {
                const { id, page } = req.body;
                const history = await this.historyService.getHistory(id, page);
                return res.status(201).json(history);
            }
            catch (error) {
                return res.status(400).json({ message: error.message });
            }
        };
        this.getChartData = async (req, res) => {
            try {
                const { id, date } = req.body;
                const ohlc = await this.historyService.getChartData(id, date);
                return res.json(ohlc);
            }
            catch (error) {
                return res.status(500).json({ message: 'Server error' });
            }
        };
        this.historyService = new historyService_1.HistoryService();
    }
}
exports.HistoryController = HistoryController;
