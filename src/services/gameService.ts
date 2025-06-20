import { Keypair, PublicKey, sendAndConfirmTransaction, Transaction } from "@solana/web3.js";
import { claimReward, createGame, depositMonitor, durationState, fetchWinner, initialize, setWinner, transferFees } from "../contract/solbet";
import { adminKP, connection, teamWallet } from "../config/constants";
import { Namespace, Server, Socket } from "socket.io";
import { EGameEvent, ESOCKET_NAMESPACE } from "../types/socket";
import { IHistory } from "../types/history";
import History from "../models/history";

export class GameService {
    public round: number = 0;
    public duration_state: boolean = false;
    private isGameInitialized: boolean = false; // Track initialization state
    private socketServer: Namespace

    constructor(socketServer: Server) {
        this.socketServer = socketServer.of(ESOCKET_NAMESPACE.game)
        this.setupConnection();
    }

    private setupConnection() {
        this.socketServer.on('connection', (socket: Socket) => {
            // Initialize game on first connection
            if (!this.isGameInitialized && this.socketServer.sockets.size === 1) {
                this.isGameInitialized = true;
                this.initialGame(adminKP);
                this.playGame(socket, adminKP, teamWallet)
            }

            this.sendUpdateRound(socket)

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
                historyData.save();
                console.log("🚀 ~ GameService ~ socket.on ~ historyData:", historyData)

                const totalAmount = await History.aggregate([
                    {
                        $match: {
                            round: data.round
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalPrice: { $sum: "$price" }
                        }
                    }
                ])

                const players = await History.find({ round })
                    .populate({
                        path: 'user_id',
                        select: 'username avatar email'
                    })

                socket.emit(EGameEvent.UPDATE_TOTAL_AMOUNT, { players, totalAmount: totalAmount[0].totalPrice });
            })

            // Handle disconnection
            socket.on('disconnect', () => {
                console.log("disconnect!")
            });
        });
    }

    private async sendUpdateRound(socket: Socket) {
        socket.emit(EGameEvent.UPDATE_ROUND, this.round);
    }

    private async sendDuration(socket: Socket, monitorRes: boolean) {
        socket.emit(EGameEvent.DURATION_STATE, monitorRes);
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
        while (1) {
            await this.newGame(adminKP, this.round);
            this.sendUpdateRound(socket)
            const monitorRes = await depositMonitor(this.round);
            if (monitorRes) {
                this.sendDuration(socket, monitorRes);
            }
            const isExpired = await durationState(this.round);
            if (isExpired) {
                const winnerRes = await this.getWinner(adminKP, this.round);
                if (winnerRes) {
                    this.sendWinner(socket, winnerRes.index);
                    await this.sendReward(adminKP, winnerRes.winner, this.round);
                    await this.gatherFees(teamWallet, adminKP, this.round);
                    this.round++;
                }
            }
        }
    }
}