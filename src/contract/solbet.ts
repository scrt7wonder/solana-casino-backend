import { AnchorProvider, Idl, Program, setProvider } from "@coral-xyz/anchor";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import { SolbetJackpotSmartContract } from "./idl/solbet_jackpot";
import idl from "./idl/solbet_jackpot.json"
import { BN } from "bn.js";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { connection, PLATFORM_FEE, ROUND_DURATION, ROUND_SEED, TEAM_WALLET } from "../config/constants";

const privateKey = Keypair.generate();
const wallet = new NodeWallet(privateKey);
const provider = new AnchorProvider(connection, wallet, {});
setProvider(provider);
const program = new Program(idl) as Program<SolbetJackpotSmartContract>;

export const initialize = async (adminPk: PublicKey) => {
  try {
    const initializeIx = await program.methods
      .initialize({
        teamWallet: new PublicKey(TEAM_WALLET),
        platformFee: new BN(PLATFORM_FEE),
        roundDuration: new BN(ROUND_DURATION),
      })
      .accounts({
        admin: adminPk,
      })
      .instruction();
    console.log("✅ Initialize transaction signature:", initializeIx);
    return initializeIx
  } catch (err) {
    console.log("Config already initialized, verifying: ", (err as Error).message);
    return null
  }
}

export const createGame = async (adminPk: PublicKey, round: number) => {
  try {
    const createGameIx = await program.methods
      .createGame(new BN(round))
      .accounts({
        admin: adminPk,
      })
      .instruction();

    console.log("✅ Create Game transaction:", createGameIx);
    return createGameIx
  } catch (error) {
    console.log("🚀 ~ createGame ~ error:", error)
  }
}

export const monitor = async (round: number) => {
  while (1) {
    // Derive round PDA
    const [roundPda] = PublicKey.findProgramAddressSync(
      [ROUND_SEED, new BN(round).toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const currentRound = await program.account.gameRound.fetch(roundPda);
    const deposites = currentRound.deposits;
    if (deposites.length >= 1) {
      return true;
    }
  }
}

export const joinGame = async (userPk: PublicKey, round: number, depositsAmount: number) => {
  try {
    const depositIx = await program.methods
      .joinGame(new BN(round), new BN(depositsAmount * LAMPORTS_PER_SOL))
      .accounts({
        user: userPk,
      })
      .instruction();
    console.log("🚀 ~ joinGame ~ depositIx:", depositIx)

    return depositIx
  } catch (error) {
    console.log("🚀 ~ joinGame ~ error:", error)
  }
}

export const setWinner = async (adminPk: PublicKey, round: number) => {
  try {
    const setWinnerIx = await program.methods
      .setWinner(new BN(round))
      .accounts({
        admin: adminPk,
      })
      .instruction();

    console.log("🏆 Set Winner TX:", setWinnerIx);
    return setWinnerIx;
  } catch (error) {
    console.log("🚀 ~ setWinner ~ error:", error)
  }
}

export const fetchWinner = async (round: number) => {
  while (1) {
    // Derive round PDA
    const [roundPda] = PublicKey.findProgramAddressSync(
      [ROUND_SEED, new BN(round).toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const currentRound = await program.account.gameRound.fetch(roundPda);
    const winner = currentRound.winner;
    if (winner) {
      return winner;
    }
  }
}

export const claimReward = async (adminPk: PublicKey, winnerPk: PublicKey, round: number) => {
  try {
    const claimRewardIx = await program.methods
      .claimReward(new BN(round))
      .accounts({
        admin: adminPk,
        winner: winnerPk,
      })
      .instruction();
    console.log("🎉 Claim Reward Ix:", claimRewardIx);
    return claimRewardIx;
  } catch (err) {
    console.log("🚀 ~ claimReward ~ err:", err)
  }
}

export const transferFees = async (teamWalPk: PublicKey, adminPk: PublicKey) => {
  const transferFeesIx = await program.methods
    .transferFees()
    .accounts({
      teamWallet: teamWalPk,
      admin: adminPk,
    })
    .instruction();
  console.log("🚀 ~ transferFees ~ transferFeesIx:", transferFeesIx)
  return transferFeesIx
}

