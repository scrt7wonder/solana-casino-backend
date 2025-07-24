import { AnchorProvider, Idl, Program, setProvider } from "@coral-xyz/anchor";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import { SolbetJackpotContract } from "./idl/solbet_jackpot";
import idl from "./idl/solbet_jackpot.json"
import { BN } from "bn.js";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { AFFILIATE_FEE, CONFIG_SEED, connection, PLATFORM_FEE, ROUND_DURATION, ROUND_SEED, teamWallet, VAULT_SEED } from "../config/constants";

const privateKey = Keypair.generate();
const wallet = new NodeWallet(privateKey);
const provider = new AnchorProvider(connection, wallet, {});
setProvider(provider);
const program = new Program(idl) as Program<SolbetJackpotContract>;


const [configPda] = PublicKey.findProgramAddressSync(
  [CONFIG_SEED],
  program.programId
)

// Derive vault PDA
const [vaultPda] = PublicKey.findProgramAddressSync(
  [VAULT_SEED],
  program.programId
);


export const initialize = async (adminPk: PublicKey) => {
  console.log("🚀 ~ program:", program.programId)
  try {
    const initializeIx = await program.methods
      .initialize({
        teamWallet: teamWallet,
        platformFee: new BN(PLATFORM_FEE),
        affiliate: new BN(AFFILIATE_FEE),
        roundDuration: new BN(ROUND_DURATION),
      })
      .accounts({
        admin: adminPk,
      })
      .instruction();
    return initializeIx
  } catch (err) {
    console.log("Config already initialized, verifying: ", (err as Error).message);
    return null
  }
}

export const fetchRound = async () => {
  const config = await program.account.config.fetch(configPda);
  const round = config.roundCounter;
  return round;
}

export const fetchIsExpired = async (round: number) => {
  const [roundPda] = PublicKey.findProgramAddressSync(
      [ROUND_SEED, new BN(round).toArrayLike(Buffer, "le", 8)],
      program.programId
    );

  const roundAcc = await program.account.gameRound.fetch(roundPda);
  const isExpired = roundAcc.isExpired;
  console.log("🚀 ~ fetchIsExpired ~ isExpired:", isExpired)
  return isExpired;
}

export const createGame = async (adminPk: PublicKey, round: number) => {
  try {
    // Derive round PDA
    const [roundPda] = PublicKey.findProgramAddressSync(
      [ROUND_SEED, new BN(round).toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const createGameIx = await program.methods
      .createGame(new BN(round))
      .accountsStrict({
        admin: adminPk,
        config: configPda,
        roundAcc: roundPda,
        systemProgram: SystemProgram.programId
      })
      .instruction();

    return createGameIx
  } catch (error) {
    console.log("🚀 ~ createGame ~ error:", error)
  }
}

export const depositMonitor = async (round: number): Promise<boolean> => {
  while (true) {
    // Derive round PDA
    const [roundPda] = PublicKey.findProgramAddressSync(
      [ROUND_SEED, new BN(round).toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const currentRound = await program.account.gameRound.fetch(roundPda);
    const deposits = currentRound.deposits;
    const isExpired = currentRound.isExpired;
    console.log("🚀 ~ depositMonitor ~ deposits:", deposits)
    if (deposits.length >= 1) {
      if (isExpired) {
        return false;
      } else
        return true;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

export const joinGame = async (userPk: PublicKey, referPK: PublicKey, round: number, depositsAmount: number) => {
  try {
    // Derive round PDA
    const [roundPda] = PublicKey.findProgramAddressSync(
      [ROUND_SEED, new BN(round).toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const depositIx = await program.methods
      .joinGame(new BN(round), new BN(depositsAmount * LAMPORTS_PER_SOL))
      .accountsStrict({
        user: userPk,
        config: configPda,
        roundAcc: roundPda,
        systemProgram: SystemProgram.programId,
        affiliateRefer: referPK,
        vault: vaultPda
      })
      .instruction();
    return depositIx
  } catch (error) {
    console.log("🚀 ~ joinGame ~ error:", error)
  }
}

export const durationState = async (round: number) => {
  while (true) {
    // Derive round PDA
    const [roundPda] = PublicKey.findProgramAddressSync(
      [ROUND_SEED, new BN(round).toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const currentRound = await program.account.gameRound.fetch(roundPda);
    const isExpired = currentRound.isExpired;
    console.log("🚀 ~ durationState ~ isExpired:", isExpired)
    if (isExpired) {
      return isExpired;
    }
  }
}

export const setWinner = async (adminPk: PublicKey, round: number) => {
  try {
    // Derive round PDA
    const [roundPda] = PublicKey.findProgramAddressSync(
      [ROUND_SEED, new BN(round).toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const setWinnerIx = await program.methods
      .setWinner(new BN(round))
      .accountsStrict({
        admin: adminPk,
        config: configPda,
        roundAcc: roundPda,
      })
      .instruction();
    return setWinnerIx;
  } catch (error) {
    console.log("🚀 ~ setWinner ~ error:", error)
  }
}

export const fetchWinner = async (round: number): Promise<{ winner: PublicKey; deposit: number; index: number, referral: PublicKey }> => {
  while (true) {
    console.log("🚀 ~ fetchWinner ~ round:", round)
    // Derive round PDA
    const [roundPda] = PublicKey.findProgramAddressSync(
      [ROUND_SEED, new BN(round).toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const currentRound = await program.account.gameRound.fetch(roundPda);
    const winner = currentRound.winner;
    const deposit = Number(currentRound.winnerDepositAmount) / LAMPORTS_PER_SOL;
    const index = Number(currentRound.winnerIndex);
    const referral = currentRound.affiliateRefer;
    if (winner && referral) {
      return { winner, deposit, index, referral };
    }
  }
}

export const claimReward = async (adminPk: PublicKey, winnerPk: PublicKey, affiliateRefer: PublicKey, round: number) => {
  try {
    // Derive round PDA
    const [roundPda] = PublicKey.findProgramAddressSync(
      [ROUND_SEED, new BN(round).toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const claimRewardIx = await program.methods
      .reward(new BN(round))
      .accountsStrict({
        admin: adminPk,
        winner: winnerPk,
        config: configPda,
        roundAcc: roundPda,
        systemProgram: SystemProgram.programId,
        vault: vaultPda,
        affiliateRefer,
        teamWallet: teamWallet
      })
      .instruction();
    return claimRewardIx;
  } catch (err) {
    console.log("🚀 ~ claimReward ~ err:", err)
  }
}

export const getTotalBetAmount = async (round: number): Promise<number> => {
  console.log("🚀 ~ fetchWinner ~ round:", round)
  // Derive round PDA
  const [roundPda] = PublicKey.findProgramAddressSync(
    [ROUND_SEED, new BN(round).toArrayLike(Buffer, "le", 8)],
    program.programId
  );

  const currentRound = await program.account.gameRound.fetch(roundPda);
  const totalBetAmount = Number(currentRound.totalAmount) / LAMPORTS_PER_SOL;
  console.log("🚀 ~ getRewardAmount ~ currentRound.totalAmount:", currentRound.totalAmount)
  return totalBetAmount
}

