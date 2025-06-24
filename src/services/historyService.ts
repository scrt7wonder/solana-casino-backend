import History from '../models/history';
import { IHistory, IntervalResult } from '../types/history';

export class HistoryService {
    public async getHistory(user_id: string): Promise<IHistory[]> {
        const historyData = await History.find({ user_id });
        return historyData
    }

    public async getChartData(user_id: string, duringDate: string): Promise<IntervalResult[]> {
        let historyData: IHistory[];
        const date = duringDate.split(" ")[1]
        if (date == "Time") {
            historyData = await History.find({ user_id });
        } else {
            const daysAgo = new Date();
            daysAgo.setDate(daysAgo.getDate() - Number(date));

            historyData = await History.find({
                user_id,
                create_at: { $gte: daysAgo }
            }).sort({ created_at: 1 });
        }
        const ohlcData = this.processIntervals(historyData);
        return ohlcData
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