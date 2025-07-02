import { AnchorProvider, Idl, Program, setProvider } from "@coral-xyz/anchor";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import { SolbetJackpotSmartContract } from "./idl/solbet_jackpot";
import idl from "./idl/solbet_jackpot.json"
import { BN } from "bn.js";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { CONFIG_SEED, connection, PLATFORM_FEE, ROUND_DURATION, ROUND_SEED, teamWallet, VAULT_SEED } from "../config/constants";
import {
  networkStateAccountAddress,
  Orao,
  randomnessAccountAddress,
} from "@orao-network/solana-vrf";
import Setting from "../models/setting";

const privateKey = Keypair.generate();
const wallet = new NodeWallet(privateKey);
const provider = new AnchorProvider(connection, wallet, {});
setProvider(provider);
const program = new Program(idl) as Program<SolbetJackpotSmartContract>;

const vrf = new Orao(provider);
let force:Keypair;
let forceBytes: Buffer;
let randomPda: PublicKey;
const networkConfigPda = networkStateAccountAddress();
const treasury = new PublicKey(
  "9ZTHWWZDpB36UFe1vszf2KEpt83vwi27jDqtHQ7NSXyR"
);

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

export const fetchRound = async () => {
  const config = await program.account.config.fetch(configPda);
  const round = config.roundCounter;
  return round;
}

export const gameState = async (round: number) => {
  try {
    // Derive round PDA
    const config = await program.account.config.fetch(configPda);
    const isCompleted = config.isCompleted;
    return isCompleted;
  } catch (error) {
    console.log("🚀 ~ GameState ~ error:", error)
  }
}

export const createGame = async (adminPk: PublicKey, round: number) => {
  try {
    force = Keypair.generate();
    forceBytes = force.publicKey.toBuffer();
    randomPda = randomnessAccountAddress(forceBytes);

    const updateSetting = await Setting.findOneAndUpdate(
      { name: "solbet" },
      {
        $set: {
          forceBytes: force.publicKey.toBuffer(),
          randomPda: randomPda.toBase58(),
        },
      },
      { new: true, upsert: true }
    )
    console.log("🚀 ~ createGame ~ updateSetting:", updateSetting)

    // Derive round PDA
    const [roundPda] = PublicKey.findProgramAddressSync(
      [ROUND_SEED, new BN(round).toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const createGameIx = await program.methods
      .createGame([...forceBytes], new BN(round))
      .accountsStrict({
        admin: adminPk,
        config: configPda,
        roundAcc: roundPda,
        networkConfig: networkConfigPda,
        random: randomPda,
        treasury: treasury,
        vrf: vrf.programId,
        systemProgram: SystemProgram.programId
      })
      .instruction();
    console.log("✅ Create Game transaction:", createGameIx);
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
    const deposites = currentRound.deposits;
    const isExpired = currentRound.isExpired;
    console.log("🚀 ~ depositMonitor ~ isExpired:", isExpired)
    console.log("🚀 ~ depositMonitor ~ deposites:", deposites)
    if (deposites.length >= 1) {
      if (isExpired) {
        return false;
      } else
        return true;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

export const joinGame = async (userPk: PublicKey, round: number, depositsAmount: number) => {
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
        vault: vaultPda
      })
      .instruction();
    console.log("🚀 ~ joinGame ~ depositIx:", depositIx)

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
    
    if (!randomPda || !forceBytes) {
      const setting = await Setting.findOne({ name: "solbet" });
      if (!setting) {
        throw new Error("Force bytes not found in settings");
      }
      forceBytes = setting.forceBytes;
      randomPda = new PublicKey(setting.randomPda);
    }
    console.log("🚀 ~ setWinner ~ forceBytes:", forceBytes)
    console.log("🚀 ~ setWinner ~ randomPda:", randomPda)
    
    const setWinnerIx = await program.methods
      .setWinner([...forceBytes], new BN(round))
      .accountsStrict({
        admin: adminPk,
        config: configPda,
        roundAcc: roundPda,
        random: randomPda,
      })
      .instruction();

    console.log("🏆 Set Winner TX:", setWinnerIx);
    return setWinnerIx;
  } catch (error) {
    console.log("🚀 ~ setWinner ~ error:", error)
  }
}

export const fetchWinner = async (round: number): Promise<{ winner: PublicKey; deposit: number; index: number }> => {
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
    if (winner) {
      return { winner, deposit, index };
    }
  }
}

export const claimReward = async (adminPk: PublicKey, winnerPk: PublicKey, round: number) => {
  try {
    // Derive round PDA
    const [roundPda] = PublicKey.findProgramAddressSync(
      [ROUND_SEED, new BN(round).toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const claimRewardIx = await program.methods
      .claimReward(new BN(round))
      .accountsStrict({
        admin: adminPk,
        winner: winnerPk,
        config: configPda,
        roundAcc: roundPda,
        systemProgram: SystemProgram.programId,
        vault: vaultPda
      })
      .instruction();
    return claimRewardIx;
  } catch (err) {
    console.log("🚀 ~ claimReward ~ err:", err)
  }
}

export const getRewardAmount = async (round: number): Promise<number> => {
  console.log("🚀 ~ fetchWinner ~ round:", round)
  // Derive round PDA
  const [roundPda] = PublicKey.findProgramAddressSync(
    [ROUND_SEED, new BN(round).toArrayLike(Buffer, "le", 8)],
    program.programId
  );

  const currentRound = await program.account.gameRound.fetch(roundPda);
  console.log("🚀 ~ getRewardAmount ~ currentRound:", currentRound)
  console.log("🚀 ~ getRewardAmount ~ currentRound.totalAmount:", currentRound.totalAmount)
  const reward = Number(currentRound.totalAmount) * (10000 - PLATFORM_FEE) / 10000;
  console.log("🚀 ~ getRewardAmount ~ reward:", reward)
  return reward
}

export const transferFees = async (teamWalPk: PublicKey, adminPk: PublicKey, round: number) => {
  // Derive round PDA
  const [roundPda] = PublicKey.findProgramAddressSync(
    [ROUND_SEED, new BN(round).toArrayLike(Buffer, "le", 8)],
    program.programId
  );

  const transferFeesIx = await program.methods
    .transferFees(new BN(round))
    .accountsStrict({
      admin: adminPk,
      teamWallet: teamWalPk,
      config: configPda,
      roundAcc: roundPda,
      systemProgram: SystemProgram.programId,
      vault: vaultPda
    })
    .instruction();
  return transferFeesIx
}

