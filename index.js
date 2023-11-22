import { getInput, setOutput, setFailed } from "@actions/core";
import { context } from "@actions/github";
import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { TransactionBlock } from "@mysten/sui.js/transactions";

const myfun = async () => {
  try {
    const nameToGreet = getInput("who-to-greet");
    const secretKey = getInput("sui-wallet-key");
    const payload = context.payload;
    const payloadJSON = JSON.stringify(payload, undefined, 2);
    console.log(`The event payload: ${payloadJSON}`);
    console.log(`Hello ${nameToGreet}!`);
    console.log(`secretKey is : ${secretKey}`);
    console.log("-=========== start ===========");

    const client = new SuiClient({ url: getFullnodeUrl("devnet") });
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
    console.log("commits", payload.commits);

    if (payload.commits && payload.commits.length > 0) {
      const commit = payload.commits[0];
      console.log("commit info : ");
      console.table(commit);
      const txb = new TransactionBlock();
      txb.moveCall({
        target:
          "0xd4628cec59b7b634895acbbfcc98b05715584a41a38fd1e3bd81113abe3ccedc::commit::push_commit",
        arguments: [
          txb.pure(
            "0xb401770826f3553df5d8a45489c46754b5fc5dd5859b0cfd28ccbc198d6a747b"
          ),
          txb.pure(commit.url),
          txb.pure(JSON.stringify(commit.author.username)),
          txb.pure(commit.message),
          txb.pure(commit.timestamp),
        ],
      });
      console.log("begin transaction=====", txb);

      const tx = await client.signAndExecuteTransactionBlock({
        signer: keypair,
        transactionBlock: txb,
      });

      console.log("transaction : ", tx);
    }
  } catch (error) {
    console.log(error);
    setFailed(error.message);
  }
};

myfun();
