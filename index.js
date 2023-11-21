import { getInput, setOutput, setFailed } from "@actions/core";
import { context } from "@actions/github";
import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";

const myfun = async () => {
  try {
    const client = new SuiClient({ url: getFullnodeUrl("devnet") });
    const coins = await client.getCoins({
      owner:
        "0xc4d17bdea567268b50cb24c783ccafc678d468a0cfce0afb84313b163cb403ef",
    });
    console.log(coins);
    console.log("get sui coins : ", coins);

    // `who-to-greet` input defined in action metadata file
    const nameToGreet = getInput("who-to-greet");
    console.log(`Hello ${nameToGreet}!`);
    const time = new Date().toTimeString();
    setOutput("time", time);
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(context.payload, undefined, 2);
    console.log(`The event payload: ${payload}`);
  } catch (error) {
    setFailed(error.message);
  }
};

myfun();
