"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = void 0;
const web3_js_1 = require("@solana/web3.js");
const solbet_1 = require("../contract/solbet");
const constants_1 = require("../config/constants");
const socket_1 = require("../types/socket");
const history_1 = __importDefault(require("../models/history"));
const user_1 = __importDefault(require("../models/user"));
const roundService_1 = require("./roundService");
const utils_1 = require("../utils/utils");
const mongoose_1 = __importDefault(require("mongoose"));
class GameService {
    constructor(socketServer) {
        this.totalBetAmount = 0;
        this.won = 0;
        this.chance = 0;
        this.game = false;
        this.remainTime = 59;
        this.round = 1;
        this.isExpired = false;
        this.monitorRes = false;
        this.timerInterval = null;
        this.initialGame = async (adminKP) => {
            try {
                const initialIx = await (0, solbet_1.initialize)(adminKP.publicKey);
                if (initialIx) {
                    const transaction = new web3_js_1.Transaction()
                        .add(initialIx);
                    // Get recent blockhash
                    const { blockhash } = await constants_1.connection.getRecentBlockhash();
                    transaction.recentBlockhash = blockhash;
                    transaction.feePayer = adminKP.publicKey;
                    // Send transaction and await for signature
                    const signature = await (0, web3_js_1.sendAndConfirmTransaction)(constants_1.connection, transaction, [adminKP]);
                    console.log("🚀 ~ GameService ~ initGame= ~ signature:", signature);
                    return true;
                }
                else {
                    console.log("Deposit failed.");
                    return false;
                }
            }
            catch (error) {
                console.log("🚀 ~ GameService ~ initGame= ~ error:", error);
                return false;
            }
        };
        this.newGame = async (adminKP, round) => {
            try {
                const createGameIx = await (0, solbet_1.createGame)(adminKP.publicKey, round);
                if (createGameIx) {
                    const transaction = new web3_js_1.Transaction()
                        .add(createGameIx);
                    // Get recent blockhash
                    const { blockhash } = await constants_1.connection.getRecentBlockhash();
                    transaction.recentBlockhash = blockhash;
                    transaction.feePayer = adminKP.publicKey;
                    console.log(await constants_1.connection.simulateTransaction(transaction));
                    // Send transaction and await for signature
                    const signature = await (0, web3_js_1.sendAndConfirmTransaction)(constants_1.connection, transaction, [adminKP]);
                    console.log("🚀 ~ GameService ~ newGame= ~ signature:", signature);
                    return true;
                }
                return false;
            }
            catch (error) {
                console.log("🚀 ~ GameService ~ newGame= ~ error:", error);
                return false;
            }
        };
        this.getWinner = async (adminKP, round) => {
            try {
                const setWinnerIx = await (0, solbet_1.setWinner)(adminKP.publicKey, round);
                if (setWinnerIx) {
                    const transaction = new web3_js_1.Transaction()
                        .add(setWinnerIx);
                    // Get recent blockhash
                    const { blockhash } = await constants_1.connection.getRecentBlockhash();
                    transaction.recentBlockhash = blockhash;
                    transaction.feePayer = adminKP.publicKey;
                    // Send transaction and await for signature
                    const signature = await (0, web3_js_1.sendAndConfirmTransaction)(constants_1.connection, transaction, [adminKP]);
                    console.log("🚀 ~ GameService ~ getWinner= ~ signature:", signature);
                    const winner = await (0, solbet_1.fetchWinner)(round);
                    return winner;
                }
                return false;
            }
            catch (error) {
                console.log("🚀 ~ GameService ~ getWinner= ~ error:", error);
                return false;
            }
        };
        this.sendReward = async (adminKP, winner, round) => {
            try {
                const claimRewardIx = await (0, solbet_1.claimReward)(adminKP.publicKey, winner, round);
                if (claimRewardIx) {
                    const transaction = new web3_js_1.Transaction()
                        .add(claimRewardIx);
                    // Get recent blockhash
                    const { blockhash } = await constants_1.connection.getRecentBlockhash();
                    transaction.recentBlockhash = blockhash;
                    transaction.feePayer = adminKP.publicKey;
                    // Send transaction and await for signature
                    const signature = await (0, web3_js_1.sendAndConfirmTransaction)(constants_1.connection, transaction, [adminKP]);
                    console.log("🚀 ~ GameService ~ sendReward= ~ signature:", signature);
                    if (signature) {
                        const reward = await (0, solbet_1.getRewardAmount)(round);
                        console.log("🚀 ~ GameService ~ sendReward= ~ reward:", reward);
                        this.won = reward / web3_js_1.LAMPORTS_PER_SOL;
                        const user = await user_1.default.findOne({ address: winner.toBase58() });
                        if (user) {
                            const saveData = {
                                sig: signature,
                                price: reward / web3_js_1.LAMPORTS_PER_SOL,
                                type: "reward",
                                status: "success",
                                create_at: new Date(),
                                round,
                                user_id: user._id
                            };
                            const historyData = new history_1.default(saveData);
                            await historyData.save();
                            return true;
                        }
                        else {
                            console.log("Can not find user!");
                            return false;
                        }
                    }
                    return false;
                }
                return false;
            }
            catch (error) {
                console.log("🚀 ~ GameService ~ sendReward= ~ error:", error);
                return false;
            }
        };
        this.gatherFees = async (teamWallet, adminKP, round) => {
            try {
                const transferFeesIx = await (0, solbet_1.transferFees)(teamWallet, adminKP.publicKey, round);
                if (transferFeesIx) {
                    const transaction = new web3_js_1.Transaction()
                        .add(transferFeesIx);
                    // Get recent blockhash
                    const { blockhash } = await constants_1.connection.getRecentBlockhash();
                    transaction.recentBlockhash = blockhash;
                    transaction.feePayer = adminKP.publicKey;
                    // Send transaction and await for signature
                    const signature = await (0, web3_js_1.sendAndConfirmTransaction)(constants_1.connection, transaction, [adminKP]);
                    console.log("🚀 ~ GameService ~ gatherFees= ~ signature:", signature);
                    return true;
                }
                return false;
            }
            catch (error) {
                console.log("🚀 ~ GameService ~ sendReward= ~ error:", error);
                return false;
            }
        };
        this.playGame = async (socket, adminKP, teamWallet) => {
            try {
                while (true) {
                    console.log("🚀 ~ GameService ~ playGame= ~ this.round:", this.round);
                    // Step 1: Start new game round
                    if (!this.game)
                        this.game = await this.newGame(adminKP, this.round);
                    if (this.game) {
                        this.sendUpdateRound(socket);
                        // Step 2: Check deposit monitor status
                        this.monitorRes = await (0, solbet_1.depositMonitor)(this.round);
                        console.log("Deposit monitor result:", this.monitorRes);
                        // Step 3: If deposits are ready, start/reset timer
                        if (this.monitorRes && this.remainTime == 59) {
                            this.sendDuration(socket);
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
                            // Step 6: Process winner
                            this.sendWinner(socket, winnerRes.index);
                            this.chance = winnerRes.deposit / this.totalBetAmount;
                            const user = await user_1.default.findOne({ address: winnerRes.winner.toBase58() });
                            if (user && user._id) {
                                const rewardRes = await this.sendReward(adminKP, winnerRes.winner, this.round);
                                if (rewardRes) {
                                    const feeRes = await this.gatherFees(teamWallet, adminKP, this.round);
                                    if (feeRes) {
                                        await this.roundService.saveWinner(this.round, this.won, this.chance, user._id.toString());
                                        await this.getRound();
                                        // Step 7: Prepare next round
                                        this.monitorRes = false;
                                        this.isExpired = false;
                                        this.remainTime = 59;
                                        this.game = false;
                                        // Notify clients of new round
                                        this.sendUpdateRound(socket);
                                    }
                                }
                            }
                        }
                    }
                    await (0, utils_1.sleep)(3000);
                }
            }
            catch (error) {
                console.error("Game loop error:", error);
                // Implement your error recovery logic here
            }
        };
        this.socketServer = socketServer.of(socket_1.ESOCKET_NAMESPACE.game);
        this.roundService = new roundService_1.RoundService();
        this.init();
        this.setupConnection();
    }
    async init() {
        // while (true) {
        //     const res = await this.initialGame(adminKP);
        //     if (res) {
        //         return
        //     }
        //     await sleep(2000);
        // }
    }
    async setupConnection() {
        this.socketServer.on('connection', (socket) => {
            // Initialize game on first connection
            if (this.socketServer.sockets.size === 1) {
                this.playGame(socket, constants_1.adminKP, constants_1.teamWallet);
            }
            this.sendUpdateRound(socket);
            this.sendUpdateTime(socket);
            this.sendDuration(socket);
            this.sendPlayer(socket, this.round);
            socket.on(socket_1.EGameEvent.GET_WAGER, async (data) => {
                this.sendWager(socket, this.round, data);
            });
            socket.on(socket_1.EGameEvent.SAVE_HISTORY, async (data) => {
                console.log("🚀 ~ GameService ~ socket.on ~ data:", data);
                const { sig, price, type, status, create_at, round, user_id } = data;
                const saveData = {
                    sig,
                    price,
                    type,
                    status,
                    create_at,
                    round,
                    user_id
                };
                const historyData = new history_1.default(saveData);
                await historyData.save();
                console.log("🚀 ~ GameService ~ socket.on ~ historyData:", historyData);
                await this.sendPlayer(socket, data.round);
            });
            socket.on(socket_1.EGameEvent.IS_EXPIRED, (state) => {
                this.isExpired = state;
            });
            // Handle disconnection
            socket.on('disconnect', () => {
                console.log("disconnect!");
            });
        });
    }
    async getRound() {
        const round = await (0, solbet_1.fetchRound)();
        console.log("🚀 ~ GameService ~ getRound ~ round:", Number(round));
        this.round = Number(round) + 1;
    }
    async sendPlayer(socket, round) {
        try {
            const aggregationResult = await history_1.default.aggregate([
                {
                    $match: {
                        round,
                        type: "deposite"
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
            const totalAmount = aggregationResult[0]?.totalPrice || 0;
            console.log("Total amount for round:", totalAmount);
            this.totalBetAmount = totalAmount;
            const players = await history_1.default.find({ round })
                .populate({
                path: 'user_id',
                select: 'username avatar email created_at'
            });
            socket.emit(socket_1.EGameEvent.UPDATE_TOTAL_AMOUNT, {
                players,
                totalAmount
            });
        }
        catch (error) {
            console.error("Error in sendPlayer:", error);
            // Emit with default values in case of error
            socket.emit(socket_1.EGameEvent.UPDATE_TOTAL_AMOUNT, {
                players: [],
                totalAmount: 0
            });
        }
    }
    async sendWager(socket, round, user_id) {
        try {
            const aggregationResult = await history_1.default.aggregate([
                {
                    $match: {
                        round,
                        type: "deposite",
                        user_id: new mongoose_1.default.Types.ObjectId(user_id)
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
            console.log("Total amount for wager:", wager);
            socket.emit(socket_1.EGameEvent.WAGER, wager);
        }
        catch (error) {
            console.error("Error in sendPlayer:", error);
        }
    }
    async sendUpdateRound(socket) {
        socket.emit(socket_1.EGameEvent.UPDATE_ROUND, this.round);
    }
    async sendUpdateTime(socket) {
        console.log("🚀 ~ GameService ~ sendDuration ~ monitorRes:", this.remainTime);
        socket.emit(socket_1.EGameEvent.UPDATE_REMAIN_TIME, this.remainTime);
    }
    async sendDuration(socket) {
        console.log("🚀 ~ GameService ~ sendDuration ~ this.monitorRes:", this.monitorRes);
        socket.emit(socket_1.EGameEvent.DURATION_STATE, this.monitorRes);
    }
    async sendWinner(socket, index) {
        socket.emit(socket_1.EGameEvent.WINNER, index);
    }
    startTimer() {
        // Clear any existing timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        this.timerInterval = setInterval(() => {
            if (this.remainTime > 0) {
                this.remainTime--;
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
exports.GameService = GameService;
