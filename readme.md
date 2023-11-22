# Hello Sui World

This action write commit info to the sui world as an Example talk to sui.

## Inputs

### `who-to-greet`

**Required** The name of the person to greet. Default `"World"`.

### `sui-wallet-key`

**Required** The wallet private key to talk to sui. **Keep this secret!!**

### sui-network

sui network  you will talk with. Possible values : 'mainnet' | 'testnet' | 'devnet' 

## Outputs

### `time`

The time we greeted you.

### `transaction`

The transaction if sui executed.

## Example usage

```yaml
uses: v1xingyue/my-github-action@main
  with:
    who-to-greet: "Mona the Octocat"
    sui-wallet-key: ${{ secrets.SUI_WALLET_PRIVATE_KEY }}
    sui-network: devnet
```

