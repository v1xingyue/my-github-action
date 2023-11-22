import { getInput, setOutput, setFailed } from "@actions/core";
import { context } from "@actions/github";
import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { getFaucetHost, requestSuiFromFaucetV0 } from "@mysten/sui.js/faucet";

const myfun = async () => {
  try {
    await requestSuiFromFaucetV0({
      host: getFaucetHost("testnet"),
      recipient:
        "0xd1ca6a7b5b91b8b7feb4d9a1bad0a867d13311258d54bdc8729b6f96aefd4116",
    });
    // `who-to-greet` input defined in action metadata file
    const nameToGreet = getInput("who-to-greet");
    const secretKey = getInput("sui-wallet-key");
    console.log(`Hello ${nameToGreet}!`);
    console.log(`secret is : ${secretKey}`);

    const client = new SuiClient({ url: getFullnodeUrl("devnet") });
    client.re;
    const keypair = Ed25519Keypair.fromSecretKey(
      Uint8Array.from(Buffer.from(secretKey, "hex"))
    );

    const address = keypair.getPublicKey().toSuiAddress();
    console.log(`sui caller address : ${address}`);

    const balance = await client.getBalance({
      owner: address,
    });
    console.log(`sui caller balance : ${balance}`);

    const time = new Date().toTimeString();
    setOutput("time", time);

    const payload = JSON.stringify(context.payload, undefined, 2);
    console.log(`The event payload: ${payload}`);
  } catch (error) {
    setFailed(error.message);
  }
};

myfun();
