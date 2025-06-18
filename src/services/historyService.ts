import History from '../models/history';
import { IHistory, IntervalResult } from '../types/history';
import { getCurrentFormattedDateTime } from '../utils/utils';

export class HistoryService {
    public async getHistory(user_id: string): Promise<IHistory[]> {
        const historyData = await History.find({ user_id });
        return historyData
    }

    public async getChartData(user_id: string): Promise<IntervalResult[]> {
        const historyData = await History.find({ user_id });
        const ohlcData = this.processIntervals(historyData);
        return ohlcData
    }

    private processIntervals(data: IHistory[]): IntervalResult[] {
        // Step 1: Sort the array by timestamp
        data.sort((a, b) => a.create_at.getTime() - b.create_at.getTime());

        // Step 2: Initialize variables
        const intervalDuration = 20 * 1000; // 5 minutes in milliseconds
        const result: IntervalResult[] = [];
        let intervalStart: number | null = null;
        let intervalEnd: number | null = null;
        let startPrice: number | null = null;
        let endPrice: number | null = null;
        let maxPrice: number = -Infinity;
        let minPrice: number = Infinity;
        let lastClosePrice: number | null = null;

        // Step 3: Process each entry in the sorted array
        data.forEach((entry, index) => {
            const currentTime = entry.create_at.getTime();


            // Initialize interval start if not set
            if (intervalStart === null) {
                intervalStart = currentTime;
                startPrice = entry.price;
            }

            // Determine if the current entry is within the current interval
            if (currentTime < intervalStart + intervalDuration) {
                // Update end price and other statistics within the interval
                intervalEnd = currentTime;
                endPrice = entry.price;
                maxPrice = Math.max(maxPrice, entry.price);
                minPrice = Math.min(minPrice, entry.price);
            } else {
                // Push the previous interval's data to result
                result.push({
                    open: lastClosePrice!,
                    close: endPrice!,
                    high: maxPrice,
                    low: minPrice,
                    date: getCurrentFormattedDateTime(currentTime),
                });
                lastClosePrice = endPrice

                // Reset for the new interval
                intervalStart = currentTime;
                startPrice = entry.price;
                intervalEnd = currentTime;
                endPrice = entry.price;
                maxPrice = entry.price;
                minPrice = entry.price;
            }

            // Handle the last entry to ensure it gets included
            if (index === data.length - 1) {
                result.push({
                    open: startPrice!,
                    close: endPrice!,
                    high: maxPrice,
                    low: minPrice,
                    date: getCurrentFormattedDateTime(currentTime),
                });
            }
        });

        return result;
    }
}