import { Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, Transaction } from "@solana/web3.js";
import { claimReward, createGame, depositMonitor, fetchIsExpired, fetchRound, fetchWinner, getTotalBetAmount, initialize, setWinner } from "../contract/solbet";
import { adminKP, AFFILIATE_FEE, connection, PLATFORM_FEE, teamWallet } from "../config/constants";
import { Namespace, Server, Socket } from "socket.io";
import { EGameEvent, ESOCKET_NAMESPACE } from "../types/socket";
import { IHistory } from "../types/history";
import History from "../models/history";
import User from "../models/user";
import { RoundService } from "./roundService";
import { getSolPrice, sleep } from "../utils/utils";
import cron from 'node-cron'
import mongoose from "mongoose";
import logger from "../utils/logger";
import Setting from "../models/setting";
import { ReferralService } from "./referralService";

export class GameService {
    public referralService: ReferralService;
    public roundService: RoundService;
    public totalBetAmount: number = 0;
    public won: number = 0;
    public solPrice: number = 0;
    public game: boolean = false;
    public rewardRes: boolean = false;
    public feeRes: boolean = false;
    private remainTime: number = 59;
    private round: number = 1;
    private isExpired: boolean = false;
    private monitorRes: boolean = false;
    private socketServer: Namespace;
    private timerInterval: NodeJS.Timeout | null = null;
    private totalAmount: number = 0;

    constructor(socketServer: Server) {
        this.socketServer = socketServer.of(ESOCKET_NAMESPACE.game);
        this.referralService = new ReferralService();
        this.roundService = new RoundService();
        this.init();
    }

    private async init() {
        await this.initialGame(adminKP);
        const setting = await Setting.findOne({ name: "solbet" });
        if (setting) {
            this.round = setting.round;
            this.totalAmount = setting.totalAmount;
            if (this.round > 1) {
                const isExpired = await fetchIsExpired(this.round);
                console.log("🚀 ~ GameService ~ init ~ isExpired:", isExpired)
                if (isExpired) {
                    this.game = false;
                    this.isExpired = true;
                    this.remainTime = 0;
                } else {
                    this.game = true;
                }
            }
        } else {
            const newData = new Setting();
            await newData.save();
            this.round = newData.round;
        }
        this.playGame(adminKP, teamWallet)
        this.setupConnection();
    }

    private async setupConnection() {
        this.socketServer.on('connection', (socket: Socket) => {
            // Initialize game on first connection
            if (this.socketServer.sockets.size === 1) {
                this.sendSolPrice(socket);
            }

            this.sendUpdateRound(socket);
            this.sendUpdateTime(socket);
            this.sendDuration(socket);
            this.sendPlayer(socket);

            socket.on(EGameEvent.GET_WAGER, async (data: string) => {
                this.sendWager(socket, this.round, data);
            })

            socket.on(EGameEvent.SAVE_HISTORY, async (data: IHistory) => {
                const { sig, price, type, status, create_at, round, user_id } = data;

                const saveData = {
                    sig,
                    price,
                    type,
                    status,
                    create_at,
                    round,
                    user_id
                }
                const historyData = new History(saveData);
                await historyData.save();

                this.totalAmount += Math.floor(price * LAMPORTS_PER_SOL);

                await Setting.findOneAndUpdate(
                    { name: "solbet" },
                    { $set: { totalAmount: this.totalAmount } },
                    { upsert: true, new: true }
                )

                await this.sendPlayer(socket);
            })

            socket.on(EGameEvent.IS_EXPIRED, (state: boolean) => {
                this.isExpired = state;
            })

            // Handle disconnection
            socket.on('disconnect', () => {
                console.log("disconnect!")
            });
        });
    }

    private async sendSolPrice(socket: Socket) {
        try {
            cron.schedule('*/15 * * * * *', async () => {
                const solPrice = await getSolPrice();
                console.log("solprice => ", solPrice);
                if (solPrice)
                    this.solPrice = solPrice;
                socket.emit(EGameEvent.SOL_PRICE, this.solPrice);
            })
        } catch (error) {
            logger.error(`Error starting socket server: ${error}`)
        }
    }

    private async getRound() {
        const round = await fetchRound();
        this.round = Number(round) + 1;

        await Setting.findOneAndUpdate(
            { name: "solbet" },
            { $set: { round: this.round } },
            { upsert: true, new: true }
        )
    }

    private async sendPlayer(socket: Socket) {
        try {
            cron.schedule('*/10 * * * * *', async () => {
                const aggregationResult = await History.aggregate([
                    {
                        $match: {
                            round: this.round,
                            type: "deposit"
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalPrice: { $sum: "$price" }
                        }
                    }
                ]);

                // Default to 0 if no records found
                const totalBetAmount = aggregationResult[0]?.totalPrice || 0;
                this.totalBetAmount = totalBetAmount;

                const players = await History.find({ round: this.round, type: "deposit" })
                    .populate({
                        path: 'user_id',
                        select: 'username avatar email created_at'
                    });

                socket.emit(EGameEvent.UPDATE_TOTAL_AMOUNT, {
                    players,
                    totalBetAmount,
                    totalAmount: this.totalAmount
                });
            })
        } catch (error) {
            // Emit with default values in case of error
            socket.emit(EGameEvent.UPDATE_TOTAL_AMOUNT, {
                players: [],
                totalBetAmount: this.totalBetAmount,
                totalAmount: this.totalBetAmount
            });
        }
    }

    private async sendWager(socket: Socket, round: number, user_id: string) {
        try {
            const aggregationResult = await History.aggregate([
                {
                    $match: {
                        round,
                        type: "deposit",
                        user_id: new mongoose.Types.ObjectId(user_id)
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalPrice: { $sum: "$price" }
                    }
                }
            ]);

            // Default to 0 if no records found
            const wager = aggregationResult[0]?.totalPrice || 0;

            socket.emit(EGameEvent.WAGER, wager);
        } catch (error) {
            console.error("Error in sendPlayer:", error);
        }
    }

    private async sendUpdateRound(socket: Socket) {
        socket.emit(EGameEvent.UPDATE_ROUND, this.round);
    }

    private async sendUpdateTime(socket: Socket) {
        socket.emit(EGameEvent.UPDATE_REMAIN_TIME, this.remainTime);
    }

    private async sendDuration(socket: Socket) {
        socket.emit(EGameEvent.DURATION_STATE, this.monitorRes);
    }

    public initialGame = async (adminKP: Keypair) => {
        try {
            const initialIx = await initialize(adminKP.publicKey);
            console.log("🚀 ~ GameService ~ initialGame= ~ initialIx:", initialIx)

            if (initialIx) {
                const transaction = new Transaction()
                    .add(initialIx)

                // Get recent blockhash
                const { blockhash } = await connection.getRecentBlockhash();
                transaction.recentBlockhash = blockhash;
                transaction.feePayer = adminKP.publicKey;

                // Send transaction and await for signature
                const signature = await sendAndConfirmTransaction(connection, transaction, [adminKP]);
                console.log("🚀 ~ GameService ~ initGame= ~ signature:", signature)
                return true;
            } else {
                console.log("Deposit failed.")
                return false;
            }
        } catch (error) {
            return false;
        }
    }

    public newGame = async (adminKP: Keypair, round: number) => {
        try {
            const createGameIx = await createGame(adminKP.publicKey, round);
            console.log("🚀 ~ GameService ~ newGame= ~ createGameIx:", createGameIx)
            if (createGameIx) {
                const transaction = new Transaction()
                    .add(createGameIx)

                // Get recent blockhash
                const { blockhash } = await connection.getRecentBlockhash();
                transaction.recentBlockhash = blockhash;
                transaction.feePayer = adminKP.publicKey;

                console.log(await connection.simulateTransaction(transaction))
                // Send transaction and await for signature
                const signature = await sendAndConfirmTransaction(connection, transaction, [adminKP]);
                console.log("🚀 ~ GameService ~ newGame= ~ signature:", signature)
                return true;
            }
            return false;
        } catch (error) {
            console.log("🚀 ~ GameService ~ newGame= ~ error:", error)
            return false;
        }
    }

    public getWinner = async (adminKP: Keypair, round: number) => {
        const setWinnerIx = await setWinner(adminKP.publicKey, round);
        if (setWinnerIx) {
            try {
                const transaction = new Transaction()
                    .add(setWinnerIx)

                // Get recent blockhash
                const { blockhash } = await connection.getRecentBlockhash();
                transaction.recentBlockhash = blockhash;
                transaction.feePayer = adminKP.publicKey;

                // Send transaction and await for signature
                const signature = await sendAndConfirmTransaction(connection, transaction, [adminKP]);
                console.log("🚀 ~ GameService ~ getWinner= ~ signature:", signature)

                const winner = await fetchWinner(round);
                return winner
            } catch (error) {
                return null
            }
        } else {
            return null;
        }
    }

    public sendReward = async (
        adminKP: Keypair,
        winnerData: {
            winner: PublicKey;
            deposit: number;
            index: number;
            referral: PublicKey;
        },
        round: number,
        maxRetries = 3,
        retryDelay = 1000
    ): Promise<boolean> => {
        try {
            const claimRewardIx = await claimReward(adminKP.publicKey, winnerData.winner, winnerData.referral, round);

            if (!claimRewardIx) {
                console.log("Claim reward instruction creation failed.");
                return false;
            }

            const transaction = new Transaction().add(claimRewardIx);
            const { blockhash } = await connection.getRecentBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = adminKP.publicKey;

            const signature = await sendAndConfirmTransaction(
                connection,
                transaction,
                [adminKP],
                { skipPreflight: true }
            );

            if (!signature) {
                console.log("Transaction failed to send.");
                return false;
            }

            let attempts = 0;
            while (attempts < maxRetries) {
                try {
                    attempts++;
                    console.log(`Processing reward (Attempt ${attempts}/${maxRetries})`);

                    const totalBetAmount = await getTotalBetAmount(round);
                    const platformFee = totalBetAmount * PLATFORM_FEE / 10000;
                    const affiliateFee = totalBetAmount * AFFILIATE_FEE / 10000;
                    const reward = totalBetAmount - platformFee;

                    this.won = reward / LAMPORTS_PER_SOL;
                    const chance = Number(winnerData.deposit) / totalBetAmount * 100;
                    console.log("🚀 ~ GameService ~ winnerData.deposit:", Number(winnerData.deposit))
                    console.log("🚀 ~ GameService ~ totalBetAmount:", Number(totalBetAmount))
                    console.log("🚀 ~ GameService ~ chance:", chance)

                    const user = await User.findOne({ address: winnerData.winner.toBase58() });
                    if (!user) {
                        throw new Error("User not found");
                    }

                    // Prepare history records
                    const historyRecords: IHistory[] = [
                        new History({
                            sig: signature,
                            price: reward,
                            type: "reward",
                            status: "success",
                            create_at: new Date(),
                            round,
                            profit: reward / winnerData.deposit * 100,
                            user_id: user._id
                        })
                    ];

                    if (winnerData.winner.toBase58() !== winnerData.referral.toBase58()) {
                        historyRecords.push(
                            new History({
                                sig: signature,
                                price: affiliateFee,
                                type: "referral",
                                status: "success",
                                create_at: new Date(),
                                round,
                                profit: (affiliateFee / platformFee) * 100,
                                user_id: user._id
                            })
                        );
                    }

                    // Save all records in parallel
                    await Promise.all(historyRecords.map(record => record.save()));

                    // Save winner information
                    await this.roundService.saveWinner(
                        round,
                        reward,
                        chance,
                        user._id.toString()
                    );

                    return true;

                } catch (error) {
                    console.error(`Attempt ${attempts} failed:`, error);
                    if (attempts < maxRetries) {
                        await new Promise(resolve => setTimeout(resolve, retryDelay));
                    }
                }
            }

            console.log(`Failed after ${maxRetries} attempts`);
            return false;

        } catch (error) {
            console.error("Error in sendReward:", error);
            return false;
        }
    };

    public playGame = async (adminKP: Keypair, teamWallet: PublicKey) => {
        try {
            while (true) {
                console.log("🚀 ~ GameService ~ playGame= ~ this.round:", this.round)
                console.log("🚀 ~ GameService ~ playGame= ~ this.game:", this.game)
                // Step 1: Start new game round
                if (!this.game) {
                    this.game = await this.newGame(adminKP, this.round);
                }
                console.log("🚀 ~ GameService ~ playGame= ~ this.game1:", this.game)
                if (this.game) {
                    this.socketServer.emit(EGameEvent.UPDATE_ROUND, this.round);

                    // Step 2: Check deposit monitor status
                    this.monitorRes = await depositMonitor(this.round);
                    console.log("Deposit monitor result:", this.monitorRes);
                    if (!this.monitorRes) {
                        this.isExpired = true;
                    }

                    // Step 3: If deposits are ready, start/reset timer
                    if (this.monitorRes && this.remainTime == 59) {
                        this.socketServer.emit(EGameEvent.DURATION_STATE, this.monitorRes);
                        this.isExpired = false;
                        this.startTimer(); // Start countdown
                    }

                    // Step 4: Wait for round expiration
                    while (!this.isExpired) {
                        await new Promise(resolve => setTimeout(resolve, 1000)); // Check every second
                        console.log(`Waiting... Time remaining: ${this.remainTime}s`);
                    }

                    // Step 5: Determine winner when time expires
                    const winnerRes = await this.getWinner(adminKP, this.round);
                    console.log("Winner result:", winnerRes);

                    if (winnerRes) {
                        this.socketServer.emit(EGameEvent.WINNER, winnerRes.index);
                        if (!this.rewardRes)
                            this.rewardRes = await this.sendReward(adminKP, winnerRes, this.round);
                        if (this.rewardRes) {
                            await this.getRound();
                            // Step 7: Prepare next round
                            this.monitorRes = false;
                            this.isExpired = false;
                            this.remainTime = 59;
                            this.game = false;
                            this.rewardRes = false;
                            this.feeRes = false;

                            console.log("🚀 ~ GameService ~ playGame= ~ this.round:", this.round)
                            this.socketServer.emit(EGameEvent.UPDATE_ROUND, this.round);
                        }
                    }
                }
                await sleep(3000);
            }
        } catch (error) {
            console.error("Game loop error:", error);
            // Implement your error recovery logic here
        }
    };

    private startTimer() {
        // Clear any existing timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        this.timerInterval = setInterval(() => {
            if (this.remainTime > 0) {
                this.remainTime--;

                this.socketServer.emit(EGameEvent.UPDATE_REMAIN_TIME, this.remainTime);

                if (this.remainTime === 0) {
                    this.isExpired = true;
                    if (this.timerInterval !== null) {
                        clearInterval(this.timerInterval);
                        this.timerInterval = null;
                    }
                }
            }
        }, 1000);
    }
}