import { getInput, setOutput, setFailed } from "@actions/core";
import { context } from "@actions/github";
import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";

const myfun = async () => {
  try {
    // `who-to-greet` input defined in action metadata file
    const nameToGreet = getInput("who-to-greet");
    const secretKey = getInput("sui-wallet-key");
    console.log(`Hello ${nameToGreet}!`);
    console.log(`secret is : ${secretKey}`);

    const client = new SuiClient({ url: getFullnodeUrl("mainnet") });

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
