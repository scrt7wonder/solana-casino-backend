import { Keypair, PublicKey, sendAndConfirmTransaction, Transaction, TransactionInstruction } from "@solana/web3.js";
import { claimReward, createGame, fetchWinner, initialize, monitor, setWinner, transferFees } from "../contract/solbet";
import { adminKP, connection } from "../config/constants";

export class GameService {
    public initialGame = async (adminKP: Keypair) => {
        try {
            const initialIx = await initialize(adminKP.publicKey);
            console.log("🚀 ~ GameService ~ initGame= ~ initialIx:", initialIx)

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

    public gatherFees = async (teamWallet: PublicKey, adminKP: Keypair) => {
        try {
            const transferFeesIx = await transferFees(teamWallet, adminKP.publicKey);
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

    public playGame = async (adminKP: Keypair, teamWallet: PublicKey, round: number) => {
        while (1) {
            await this.newGame(adminKP, round);
            await monitor(round);
            const winner = await this.getWinner(adminKP, round);
            await this.sendReward(adminKP, winner!, round);
            await this.gatherFees(teamWallet, adminKP);
            round++;
        }
    }
}