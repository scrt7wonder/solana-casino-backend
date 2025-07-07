import History from '../models/history';
import { IDurationHistory, IHistory, IntervalResult } from '../types/history';

export class HistoryService {
    public async getHistory(user_id: string, page: number = 1): Promise<{
        data: IHistory[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        const perPage = 10; // Items per page
        const skip = (page - 1) * perPage;

        // Get paginated data
        const historyData = await History.find({ user_id })
            .sort({ create_at: -1 }) // Sort by newest first
            .skip(skip)
            .limit(perPage);

        // Get total count for pagination info
        const total = await History.countDocuments({ user_id });

        return {
            data: historyData,
            total,
            page,
            totalPages: Math.ceil(total / perPage),
        };
    }

    public async getChartData(user_id: string, duringDate: string): Promise<IDurationHistory> {
        let historyData: IHistory[];
        let totalDeposit = 0;
        let totalReward = 0;
        let biggestWin = 0;
        let luckiestWin = 0;
        const date = duringDate.split(" ")[1]
        if (date == "Time") {
            historyData = await History.find({ user_id });
            const depositsRes = await History.aggregate([
                {
                    $match: {
                        user_id,
                        type: "deposit"
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalDeposit: { $sum: "$price" }
                    }
                }
            ])
            totalDeposit = depositsRes.length > 0 ? depositsRes[0].totalDeposit : 0;

            const rewardRes = await History.aggregate([
                {
                    $match: {
                        user_id,
                        type: "reward"
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalReward: { $sum: "$price" }
                    }
                }
            ])
            totalReward = rewardRes.length > 0 ? rewardRes[0].totalDeposit : 0;

            const biggestWinRes = await History.find({ user_id, type: "reward" }).sort({ price: -1 }).limit(1);
            biggestWin = biggestWinRes.length > 0 ? biggestWinRes[0].price : 0;

            const luckiest = await History.find({
                user_id,
                type: "reward",
            }).sort({ profit: -1 }).limit(1);
            luckiestWin = luckiest.length > 0 ? luckiest[0].profit : 0;
        } else {
            const daysAgo = new Date();
            daysAgo.setDate(daysAgo.getDate() - Number(date));

            historyData = await History.find({
                user_id,
                create_at: { $gte: daysAgo }
            }).sort({ created_at: 1 });
            const depositsRes = await History.aggregate([
                {
                    $match: {
                        user_id,
                        type: "deposit",
                        create_at: { $gte: daysAgo }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalDeposit: { $sum: "$price" }
                    }
                }
            ])
            totalDeposit = depositsRes.length > 0 ? depositsRes[0].totalDeposit : 0;

            const rewardRes = await History.aggregate([
                {
                    $match: {
                        user_id,
                        type: "reward",
                        create_at: { $gte: daysAgo }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalReward: { $sum: "$price" }
                    }
                }
            ])
            totalReward = rewardRes.length > 0 ? rewardRes[0].totalDeposit : 0;

            const biggestWinRes = await History.find({
                user_id,
                type: "reward",
                create_at: { $gte: daysAgo }
            }).sort({ price: -1 }).limit(1);
            biggestWin = biggestWinRes.length > 0 ? biggestWinRes[0].price : 0;

            const luckiest = await History.find({
                user_id,
                type: "reward",
                create_at: { $gte: daysAgo }
            }).sort({ profit: -1 }).limit(1);
            luckiestWin = luckiest.length > 0 ? luckiest[0].profit : 0;
        }
        const ohlcData = this.processIntervals(historyData);
        return { ohlcData, totalDeposit, totalReward, biggestWin, luckiestWin }
    }

    private processIntervals(data: IHistory[]): IntervalResult[] {
        // Step 1: Sort data by timestamp (ascending)
        data.sort((a, b) => a.create_at.getTime() - b.create_at.getTime());

        // Step 2: Remove ALL duplicate timestamps (not just keep last)
        const uniqueData: IHistory[] = [];
        const seenTimestamps = new Set<number>();

        for (const entry of data) {
            const timestamp = entry.create_at.getTime();
            if (!seenTimestamps.has(timestamp)) {
                seenTimestamps.add(timestamp);
                uniqueData.push(entry);
            }
        }

        // Step 3: Initialize interval tracking variables
        const intervalDuration = 20 * 1000; // 20 seconds
        const result: IntervalResult[] = [];
        let currentInterval: {
            startTime: number;
            open: number;
            high: number;
            low: number;
            close: number;
        } | null = null;

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
            } else {
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