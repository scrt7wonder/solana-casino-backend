"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoryService = void 0;
const history_1 = __importDefault(require("../models/history"));
class HistoryService {
    async getHistory(user_id, page = 1) {
        const perPage = 10; // Items per page
        const skip = (page - 1) * perPage;
        // Get paginated data
        const historyData = await history_1.default.find({ user_id })
            .sort({ create_at: -1 }) // Sort by newest first
            .skip(skip)
            .limit(perPage);
        // Get total count for pagination info
        const total = await history_1.default.countDocuments({ user_id });
        return {
            data: historyData,
            total,
            page,
            totalPages: Math.ceil(total / perPage),
        };
    }
    async getChartData(user_id, duringDate) {
        let historyData;
        const date = duringDate.split(" ")[1];
        if (date == "Time") {
            historyData = await history_1.default.find({ user_id });
        }
        else {
            const daysAgo = new Date();
            daysAgo.setDate(daysAgo.getDate() - Number(date));
            historyData = await history_1.default.find({
                user_id,
                create_at: { $gte: daysAgo }
            }).sort({ created_at: 1 });
        }
        const ohlcData = this.processIntervals(historyData);
        return ohlcData;
    }
    processIntervals(data) {
        // Step 1: Sort data by timestamp (ascending)
        data.sort((a, b) => a.create_at.getTime() - b.create_at.getTime());
        // Step 2: Remove ALL duplicate timestamps (not just keep last)
        const uniqueData = [];
        const seenTimestamps = new Set();
        for (const entry of data) {
            const timestamp = entry.create_at.getTime();
            if (!seenTimestamps.has(timestamp)) {
                seenTimestamps.add(timestamp);
                uniqueData.push(entry);
            }
        }
        // Step 3: Initialize interval tracking variables
        const intervalDuration = 20 * 1000; // 20 seconds
        const result = [];
        let currentInterval = null;
        // Step 4: Process each unique entry
        for (const entry of uniqueData) {
            const entryTime = entry.create_at.getTime();
            const entryPrice = entry.price;
            // Initialize first interval
            if (!currentInterval) {
                currentInterval = {
                    startTime: entryTime,
                    open: entryPrice,
                    high: entryPrice,
                    low: entryPrice,
                    close: entryPrice
                };
                continue;
            }
            // Check if within current interval
            if (entryTime < currentInterval.startTime + intervalDuration) {
                // Update current interval stats
                currentInterval.high = Math.max(currentInterval.high, entryPrice);
                currentInterval.low = Math.min(currentInterval.low, entryPrice);
                currentInterval.close = entryPrice;
            }
            else {
                // Finalize current interval
                result.push({
                    open: currentInterval.open,
                    high: currentInterval.high,
                    low: currentInterval.low,
                    close: currentInterval.close,
                    time: currentInterval.startTime
                });
                // Start new interval
                currentInterval = {
                    startTime: entryTime,
                    open: currentInterval.close, // New interval opens at previous close
                    high: entryPrice,
                    low: entryPrice,
                    close: entryPrice
                };
            }
        }
        // Add the last interval if it exists
        if (currentInterval) {
            result.push({
                open: currentInterval.open,
                high: currentInterval.high,
                low: currentInterval.low,
                close: currentInterval.close,
                time: currentInterval.startTime
            });
        }
        // Final validation
        if (result.length > 1) {
            for (let i = 1; i < result.length; i++) {
                if (result[i].time <= result[i - 1].time) {
                    throw new Error(`Non-ascending timestamps at index ${i}`);
                }
            }
        }
        return result;
    }
}
exports.HistoryService = HistoryService;
