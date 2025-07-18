import mongoose from 'mongoose';
import History from '../models/history';
import { IDurationHistory, IHistory, IntervalResult } from '../types/history';

export class HistoryService {
    public async getAffiliate(
        userId: string,
        duringDate: string
    ): Promise<{ ohlcData: IntervalResult[]; duringEarn: number; earn: number }> {
        try {
            const userIdObj = new mongoose.Types.ObjectId(userId);

            // Prepare base filter
            const baseFilter = {
                user_id: userIdObj,
                type: "referral" as const,
            };

            // Check if we need date filtering
            const datePart = duringDate.split(" ")[1];
            const useDateFilter = datePart !== "Time";

            // Prepare date filter if needed
            let dateFilter = {};
            if (useDateFilter) {
                const daysAgo = new Date();
                daysAgo.setDate(daysAgo.getDate() - Number(datePart));
                dateFilter = { created_at: { $gte: daysAgo } };
            }

            // Execute all queries in parallel for better performance
            const [historyData, totalEarnRes, duringEarnRes] = await Promise.all([
                // Get historical data
                History.find({
                    ...baseFilter,
                    ...(useDateFilter && dateFilter),
                }).sort({ created_at: 1 }),

                // Get lifetime earnings
                History.aggregate([
                    { $match: baseFilter },
                    { $group: { _id: null, totalEarn: { $sum: "$price" } } },
                ]),

                // Get period earnings (only if date filtered)
                useDateFilter
                    ? History.aggregate([
                        { $match: { ...baseFilter, ...dateFilter } },
                        { $group: { _id: null, totalEarn: { $sum: "$price" } } },
                    ])
                    : Promise.resolve([]),
            ]);

            // Process results
            const totalEarned = totalEarnRes[0]?.totalEarn || 0;
            const duringEarn = useDateFilter
                ? duringEarnRes[0]?.totalEarn || 0
                : totalEarned;

            const ohlcData = this.processIntervals(historyData);

            return {
                ohlcData,
                duringEarn,
                earn: totalEarned,
            };
        } catch (error) {
            console.error('Error in getAffiliate:', error);
            throw error; // Or return default values
        }
    }

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
        try {
            const date = duringDate.split(" ")[1]
            const userId = new mongoose.Types.ObjectId(user_id);
            let filter: any = { user_id: userId };
            let dateFilter = {};

            // Parse date filter if not "Time"
            if (date !== "Time") {
                const daysAgo = new Date();
                daysAgo.setDate(daysAgo.getDate() - Number(date));
                dateFilter = { created_at: { $gte: daysAgo } };
                filter = { ...filter, ...dateFilter };
            }

            // Get all history data first (more efficient than multiple queries)
            const historyData = await History.find(filter).sort({ created_at: 1 });

            // Run aggregations in parallel for better performance
            const [depositsRes, rewardRes] = await Promise.all([
                History.aggregate([
                    { $match: { ...filter, type: "deposit" } },
                    { $group: { _id: null, totalDeposit: { $sum: "$price" } } }
                ]),
                History.aggregate([
                    { $match: { ...filter, type: "reward" } },
                    { $group: { _id: null, totalReward: { $sum: "$price" } } }
                ])
            ]);

            // Get biggest wins in single query
            const [biggestWinRes, luckiestWinRes] = await Promise.all([
                History.find({ ...filter, type: "reward" })
                    .sort({ price: -1 })
                    .limit(1),
                History.find({ ...filter, type: "reward" })
                    .sort({ profit: -1 })
                    .limit(1)
            ]);

            // Process results
            const tDeposit = depositsRes[0]?.totalDeposit || 0;
            const tReward = rewardRes[0]?.totalReward || 0;
            const biggestWin = biggestWinRes[0]?.price || 0;
            const luckiestWin = luckiestWinRes[0]?.profit || 0;

            const ohlcData = this.processIntervals(historyData);

            return {
                ohlcData,
                tDeposit,
                tReward,
                biggestWin,
                luckiestWin
            };
        } catch (error) {
            console.error("Error in getChartData:", error);
            throw error; // Or return default values
        }
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