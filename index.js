import { getInput, setOutput, setFailed } from "@actions/core";
import { context } from "@actions/github";
import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { TransactionBlock } from "@mysten/sui.js/transactions";

const packageAddres =
  "0xd4628cec59b7b634895acbbfcc98b05715584a41a38fd1e3bd81113abe3ccedc";

const shareTableId =
  "0x46d17eb9439ab967a7ec8d3492ff22b1544226e930a6ce11d5ec1be182e9890d";

const targetAddress = (module, name) => {
  return `${packageAddres}::${module}::${name}`;
};

const transactionLink = (network, tx) => {
  return `https://suiexplorer.com/txblock/${tx}?network=${network}`;
};

const parseTransaction = (msg) => {
  const pattern = /^transfer (\S+) (\d+) sui$/m;
  const match = msg.match(pattern);

  if (match) {
    return {
      address: match[1],
      quantity: parseInt(match[2], 10),
    };
  }

  return null;
};

const myfun = async () => {
  try {
    const network = getInput("sui-network");
    const secretKey = getInput("sui-wallet-key");
    const payload = context.payload;
    const payloadJSON = JSON.stringify(payload, undefined, 2);
    const keypair = Ed25519Keypair.fromSecretKey(
      Uint8Array.from(Buffer.from(secretKey, "hex"))
    );
    const address = keypair.getPublicKey().toSuiAddress();

    console.log(`network is ${network}`);
    console.log(`The event payload: ${payloadJSON}`);

    console.log(`secretKey is : ${secretKey}`);
    console.log(`sui caller address : ${address}`);
    console.log("commits", payload.commits);
    console.log("-=========== start ===========");

    const client = new SuiClient({ url: getFullnodeUrl(network) });

    const balance = await client.getBalance({
      owner: address,
    });

    console.log(`sui caller balance : ${balance.toString()}`);

    const time = new Date().toTimeString();
    setOutput("time", time);

    if (payload.commits && payload.commits.length > 0) {
      const txb = new TransactionBlock();

      payload.commits.forEach((commit) => {
        console.log("commit info : ");
        console.table(commit);

        const t = parseTransaction(commit.message);
        if (t != null) {
          console.log(t);
          const [coin] = txb.splitCoins(txb.gas, [t.quantity]);
          txb.transferObjects([coin], t.address);
        }

        txb.moveCall({
          target: targetAddress("commit", "push_commit"),
          arguments: [
            txb.object(shareTableId),
            txb.pure(commit.url),
            txb.pure(JSON.stringify(commit.author.username)),
            txb.pure(commit.message),
            txb.pure(commit.timestamp),
          ],
        });
      });

      const tx = await client.signAndExecuteTransactionBlock({
        signer: keypair,
        transactionBlock: txb,
      });

      console.log("transaction : ", tx);
      setOutput("transaction", transactionLink(network, tx.digest));
    }
  } catch (error) {
    console.log(error);
    setFailed(error.message);
  }
};

myfun();
