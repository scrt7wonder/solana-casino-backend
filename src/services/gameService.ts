import { Keypair, PublicKey, sendAndConfirmTransaction, Transaction } from "@solana/web3.js";
import { claimReward, createGame, depositMonitor, fetchWinner, getRewardAmount, initialize, setWinner, transferFees } from "../contract/solbet";
import { adminKP, connection, teamWallet } from "../config/constants";
import { Namespace, Server, Socket } from "socket.io";
import { EGameEvent, ESOCKET_NAMESPACE } from "../types/socket";
import { IHistory } from "../types/history";
import History from "../models/history";
import User from "../models/user";
import { IUser } from "../types/user";
import { RoundService } from "./roundService";

export class GameService {
    public roundService: RoundService;
    public totalBetAmount: number = 0;
    public won: number = 0;
    public chance: number = 0;
    private remainTime: number = 59;
    private round: number = 31;
    private isExpired: boolean = false;
    private monitorRes: boolean = false;
    private socketServer: Namespace;
    private timerInterval: NodeJS.Timeout | null = null;


    constructor(socketServer: Server) {
        this.socketServer = socketServer.of(ESOCKET_NAMESPACE.game);
        this.roundService = new RoundService();
        this.initialGame(adminKP);
        this.setupConnection();
    }

    private async setupConnection() {
        this.socketServer.on('connection', (socket: Socket) => {
            // Initialize game on first connection
            if (this.socketServer.sockets.size === 1) {
                this.playGame(socket, adminKP, teamWallet)
            }

            this.sendUpdateRound(socket);
            this.sendUpdateTime(socket);
            this.sendDuration(socket);
            this.sendPlayer(socket, this.round);

            socket.on(EGameEvent.GET_WAGER, async (data: string) => {
                this.sendWager(socket, this.round, data);
            })

            socket.on(EGameEvent.SAVE_HISTORY, async (data: IHistory) => {
                console.log("🚀 ~ GameService ~ socket.on ~ data:", data)
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
                console.log("🚀 ~ GameService ~ socket.on ~ historyData:", historyData)

                await this.sendPlayer(socket, data.round);
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

    private async sendPlayer(socket: Socket, round: number) {
        try {
            const aggregationResult = await History.aggregate([
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

            const players = await History.find({ round })
                .populate({
                    path: 'user_id',
                    select: 'username avatar email created_at'
                });

            socket.emit(EGameEvent.UPDATE_TOTAL_AMOUNT, {
                players,
                totalAmount
            });
        } catch (error) {
            console.error("Error in sendPlayer:", error);
            // Emit with default values in case of error
            socket.emit(EGameEvent.UPDATE_TOTAL_AMOUNT, {
                players: [],
                totalAmount: 0
            });
        }
    }

    private async sendWager(socket: Socket, round: number, user_id: string) {
        try {
            const aggregationResult = await History.aggregate([
                {
                    $match: {
                        round,
                        type: "deposite",
                        user_id
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
            console.log("Total amount for round:", wager);

            socket.emit(EGameEvent.WAGER, wager);
        } catch (error) {
            console.error("Error in sendPlayer:", error);
            // Emit with default values in case of error
            socket.emit(EGameEvent.UPDATE_TOTAL_AMOUNT, {
                players: [],
                totalAmount: 0
            });
        }
    }

    private async sendUpdateRound(socket: Socket) {
        socket.emit(EGameEvent.UPDATE_ROUND, this.round);
    }

    private async sendUpdateTime(socket: Socket) {
        console.log("🚀 ~ GameService ~ sendDuration ~ monitorRes:", this.remainTime)
        socket.emit(EGameEvent.UPDATE_REMAIN_TIME, this.remainTime);
    }

    private async sendDuration(socket: Socket) {
        console.log("🚀 ~ GameService ~ sendDuration ~ this.monitorRes:", this.monitorRes)
        socket.emit(EGameEvent.DURATION_STATE, this.monitorRes);
    }

    private async sendWinner(socket: Socket, index: number) {
        socket.emit(EGameEvent.WINNER, index);
    }

    public initialGame = async (adminKP: Keypair) => {
        try {
            const initialIx = await initialize(adminKP.publicKey);

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
            } else {
                console.log("Deposit failed.")
            }
        } catch (error) {
            console.log("🚀 ~ GameService ~ initGame= ~ error:", error)
        }
    }

    public newGame = async (adminKP: Keypair, round: number) => {
        try {
            const createGameIx = await createGame(adminKP.publicKey, round);
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
            }
        } catch (error) {
            console.log("🚀 ~ GameService ~ newGame= ~ error:", error)
        }
    }

    public getWinner = async (adminKP: Keypair, round: number) => {
        try {
            const setWinnerIx = await setWinner(adminKP.publicKey, round);
            if (setWinnerIx) {
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
            }
        } catch (error) {
            console.log("🚀 ~ GameService ~ getWinner= ~ error:", error)
        }
    }

    public sendReward = async (adminKP: Keypair, winner: PublicKey, round: number) => {
        try {
            const claimRewardIx = await claimReward(adminKP.publicKey, winner, round);
            if (claimRewardIx) {
                const transaction = new Transaction()
                    .add(claimRewardIx)

                // Get recent blockhash
                const { blockhash } = await connection.getRecentBlockhash();
                transaction.recentBlockhash = blockhash;
                transaction.feePayer = adminKP.publicKey;

                // Send transaction and await for signature
                const signature = await sendAndConfirmTransaction(connection, transaction, [adminKP]);
                console.log("🚀 ~ GameService ~ sendReward= ~ signature:", signature)
                if (signature) {
                    const reward = await getRewardAmount(round);
                    this.won = reward;
                    const user: IUser | null = await User.findOne({ address: winner.toBase58() })
                    if (user) {
                        const saveData = {
                            sig: signature,
                            price: reward,
                            type: "reward",
                            status: "success",
                            create_at: new Date(),
                            round,
                            user_id: user._id
                        }
                        const historyData = new History(saveData);
                        await historyData.save();
                    } else {
                        console.log("Can not find user!");
                    }
                }
            }
        } catch (error) {
            console.log("🚀 ~ GameService ~ sendReward= ~ error:", error)
        }
    }

    public gatherFees = async (teamWallet: PublicKey, adminKP: Keypair, round: number) => {
        try {
            const transferFeesIx = await transferFees(teamWallet, adminKP.publicKey, round);
            if (transferFeesIx) {
                const transaction = new Transaction()
                    .add(transferFeesIx)

                // Get recent blockhash
                const { blockhash } = await connection.getRecentBlockhash();
                transaction.recentBlockhash = blockhash;
                transaction.feePayer = adminKP.publicKey;

                // Send transaction and await for signature
                const signature = await sendAndConfirmTransaction(connection, transaction, [adminKP]);
                console.log("🚀 ~ GameService ~ gatherFees= ~ signature:", signature)
            }
        } catch (error) {
            console.log("🚀 ~ GameService ~ sendReward= ~ error:", error)
        }
    }

    public playGame = async (socket: Socket, adminKP: Keypair, teamWallet: PublicKey) => {
        try {
            while (true) {
                // Step 1: Start new game round
                await this.newGame(adminKP, this.round);
                this.sendUpdateRound(socket);

                // Step 2: Check deposit monitor status
                this.monitorRes = await depositMonitor(this.round);
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
                    const user = await User.findOne({ address: winnerRes.winner.toBase58() })
                    await this.sendReward(adminKP, winnerRes.winner, this.round);
                    await this.gatherFees(teamWallet, adminKP, this.round);
                    if (user && user._id) {
                        this.roundService.saveWinner(
                            this.round,
                            this.won,
                            this.chance,
                            user._id.toString()
                        );

                        // Step 7: Prepare next round
                        this.round++;
                        this.monitorRes = false;
                        this.isExpired = false;
                        this.remainTime = 59;

                        // Notify clients of new round
                        this.sendUpdateRound(socket);
                    }
                }
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