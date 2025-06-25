"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferFees = exports.getRewardAmount = exports.claimReward = exports.fetchWinner = exports.setWinner = exports.durationState = exports.joinGame = exports.depositMonitor = exports.createGame = exports.fetchRound = exports.initialize = void 0;
const anchor_1 = require("@coral-xyz/anchor");
const web3_js_1 = require("@solana/web3.js");
const solbet_jackpot_json_1 = __importDefault(require("./idl/solbet_jackpot.json"));
const bn_js_1 = require("bn.js");
const nodewallet_1 = __importDefault(require("@coral-xyz/anchor/dist/cjs/nodewallet"));
const constants_1 = require("../config/constants");
const privateKey = web3_js_1.Keypair.generate();
const wallet = new nodewallet_1.default(privateKey);
const provider = new anchor_1.AnchorProvider(constants_1.connection, wallet, {});
(0, anchor_1.setProvider)(provider);
const program = new anchor_1.Program(solbet_jackpot_json_1.default);
const [configPda] = web3_js_1.PublicKey.findProgramAddressSync([constants_1.CONFIG_SEED], program.programId);
// Derive vault PDA
const [vaultPda] = web3_js_1.PublicKey.findProgramAddressSync([constants_1.VAULT_SEED], program.programId);
const initialize = async (adminPk) => {
    console.log("🚀 ~ program:", program.programId);
    try {
        const initializeIx = await program.methods
            .initialize({
            teamWallet: constants_1.teamWallet,
            platformFee: new bn_js_1.BN(constants_1.PLATFORM_FEE),
            roundDuration: new bn_js_1.BN(constants_1.ROUND_DURATION),
        })
            .accounts({
            admin: adminPk,
        })
            .instruction();
        console.log("✅ Initialize transaction signature:", initializeIx);
        return initializeIx;
    }
    catch (err) {
        console.log("Config already initialized, verifying: ", err.message);
        return null;
    }
};
exports.initialize = initialize;
const fetchRound = async () => {
    const config = await program.account.config.fetch(configPda);
    const round = config.roundCounter;
    return round;
};
exports.fetchRound = fetchRound;
const createGame = async (adminPk, round) => {
    try {
        // Derive round PDA
        const [roundPda] = web3_js_1.PublicKey.findProgramAddressSync([constants_1.ROUND_SEED, new bn_js_1.BN(round).toArrayLike(Buffer, "le", 8)], program.programId);
        const createGameIx = await program.methods
            .createGame(new bn_js_1.BN(round))
            .accountsStrict({
            admin: adminPk,
            config: configPda,
            roundAcc: roundPda,
            systemProgram: web3_js_1.SystemProgram.programId
        })
            .instruction();
        console.log("✅ Create Game transaction:", createGameIx);
        return createGameIx;
    }
    catch (error) {
        console.log("🚀 ~ createGame ~ error:", error);
    }
};
exports.createGame = createGame;
const depositMonitor = async (round) => {
    while (true) {
        // Derive round PDA
        const [roundPda] = web3_js_1.PublicKey.findProgramAddressSync([constants_1.ROUND_SEED, new bn_js_1.BN(round).toArrayLike(Buffer, "le", 8)], program.programId);
        const currentRound = await program.account.gameRound.fetch(roundPda);
        const deposites = currentRound.deposits;
        console.log("🚀 ~ depositMonitor ~ deposites:", deposites);
        if (deposites.length >= 1) {
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
};
exports.depositMonitor = depositMonitor;
const joinGame = async (userPk, round, depositsAmount) => {
    try {
        // Derive round PDA
        const [roundPda] = web3_js_1.PublicKey.findProgramAddressSync([constants_1.ROUND_SEED, new bn_js_1.BN(round).toArrayLike(Buffer, "le", 8)], program.programId);
        const depositIx = await program.methods
            .joinGame(new bn_js_1.BN(round), new bn_js_1.BN(depositsAmount * web3_js_1.LAMPORTS_PER_SOL))
            .accountsStrict({
            user: userPk,
            config: configPda,
            roundAcc: roundPda,
            systemProgram: web3_js_1.SystemProgram.programId,
            vault: vaultPda
        })
            .instruction();
        console.log("🚀 ~ joinGame ~ depositIx:", depositIx);
        return depositIx;
    }
    catch (error) {
        console.log("🚀 ~ joinGame ~ error:", error);
    }
};
exports.joinGame = joinGame;
const durationState = async (round) => {
    while (true) {
        // Derive round PDA
        const [roundPda] = web3_js_1.PublicKey.findProgramAddressSync([constants_1.ROUND_SEED, new bn_js_1.BN(round).toArrayLike(Buffer, "le", 8)], program.programId);
        const currentRound = await program.account.gameRound.fetch(roundPda);
        const isExpired = currentRound.isExpired;
        console.log("🚀 ~ durationState ~ isExpired:", isExpired);
        if (isExpired) {
            return isExpired;
        }
    }
};
exports.durationState = durationState;
const setWinner = async (adminPk, round) => {
    try {
        // Derive round PDA
        const [roundPda] = web3_js_1.PublicKey.findProgramAddressSync([constants_1.ROUND_SEED, new bn_js_1.BN(round).toArrayLike(Buffer, "le", 8)], program.programId);
        const setWinnerIx = await program.methods
            .setWinner(new bn_js_1.BN(round))
            .accountsStrict({
            admin: adminPk,
            config: configPda,
            roundAcc: roundPda,
        })
            .instruction();
        console.log("🏆 Set Winner TX:", setWinnerIx);
        return setWinnerIx;
    }
    catch (error) {
        console.log("🚀 ~ setWinner ~ error:", error);
    }
};
exports.setWinner = setWinner;
const fetchWinner = async (round) => {
    while (true) {
        console.log("🚀 ~ fetchWinner ~ round:", round);
        // Derive round PDA
        const [roundPda] = web3_js_1.PublicKey.findProgramAddressSync([constants_1.ROUND_SEED, new bn_js_1.BN(round).toArrayLike(Buffer, "le", 8)], program.programId);
        const currentRound = await program.account.gameRound.fetch(roundPda);
        const winner = currentRound.winner;
        const deposit = Number(currentRound.winnerDepositAmount) / web3_js_1.LAMPORTS_PER_SOL;
        const index = Number(currentRound.winnerIndex);
        if (winner) {
            return { winner, deposit, index };
        }
    }
};
exports.fetchWinner = fetchWinner;
const claimReward = async (adminPk, winnerPk, round) => {
    try {
        // Derive round PDA
        const [roundPda] = web3_js_1.PublicKey.findProgramAddressSync([constants_1.ROUND_SEED, new bn_js_1.BN(round).toArrayLike(Buffer, "le", 8)], program.programId);
        const claimRewardIx = await program.methods
            .claimReward(new bn_js_1.BN(round))
            .accountsStrict({
            admin: adminPk,
            winner: winnerPk,
            config: configPda,
            roundAcc: roundPda,
            systemProgram: web3_js_1.SystemProgram.programId,
            vault: vaultPda
        })
            .instruction();
        return claimRewardIx;
    }
    catch (err) {
        console.log("🚀 ~ claimReward ~ err:", err);
    }
};
exports.claimReward = claimReward;
const getRewardAmount = async (round) => {
    console.log("🚀 ~ fetchWinner ~ round:", round);
    // Derive round PDA
    const [roundPda] = web3_js_1.PublicKey.findProgramAddressSync([constants_1.ROUND_SEED, new bn_js_1.BN(round).toArrayLike(Buffer, "le", 8)], program.programId);
    const currentRound = await program.account.gameRound.fetch(roundPda);
    console.log("🚀 ~ getRewardAmount ~ currentRound:", currentRound);
    console.log("🚀 ~ getRewardAmount ~ currentRound.totalAmount:", currentRound.totalAmount);
    const reward = Number(currentRound.totalAmount) * (10000 - constants_1.PLATFORM_FEE) / 10000;
    console.log("🚀 ~ getRewardAmount ~ reward:", reward);
    return reward;
};
exports.getRewardAmount = getRewardAmount;
const transferFees = async (teamWalPk, adminPk, round) => {
    // Derive round PDA
    const [roundPda] = web3_js_1.PublicKey.findProgramAddressSync([constants_1.ROUND_SEED, new bn_js_1.BN(round).toArrayLike(Buffer, "le", 8)], program.programId);
    const transferFeesIx = await program.methods
        .transferFees(new bn_js_1.BN(round))
        .accountsStrict({
        admin: adminPk,
        teamWallet: teamWalPk,
        config: configPda,
        roundAcc: roundPda,
        systemProgram: web3_js_1.SystemProgram.programId,
        vault: vaultPda
    })
        .instruction();
    return transferFeesIx;
};
exports.transferFees = transferFees;
