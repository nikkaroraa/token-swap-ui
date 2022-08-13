import { Box, Button, FormControl, FormLabel, Stack, Input } from "@chakra-ui/react"
import { FC, useState } from "react"
import * as Web3 from "@solana/web3.js"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import {
  TokenSwap,
  TOKEN_SWAP_PROGRAM_ID,
  TokenSwapLayout,
  CurveType,
} from "@solana/spl-token-swap"
import * as token from "@solana/spl-token"

/*
  Steps:
    - Create token-swap-state account
    - Find swap-pool authority
    - Create token accounts for Token A and Token B
    - Create pool-token-mint
    - Create pool-token-account
    - Create pool-token-fee-account

    - Finally create the swap pool
*/

const FEE_OWNER = new Web3.PublicKey("HfoTxFR1Tm6kGmWgYWD6J7YHVy1UwqSULUGVLXkJqaKN")

async function buildCreateMintIxs(
  connection: Web3.Connection,
  payer: Web3.PublicKey,
  owner: Web3.PublicKey,
  decimals: number
) {
  const lamports = await token.getMinimumBalanceForRentExemptMint(connection)
  const accountKeypair = Web3.Keypair.generate()
  const programId = token.TOKEN_PROGRAM_ID

  const createAccountIx = Web3.SystemProgram.createAccount({
    fromPubkey: payer,
    newAccountPubkey: accountKeypair.publicKey,
    space: token.MINT_SIZE,
    lamports,
    programId,
  })

  const initializeMintAccountIx = token.createInitializeMintInstruction(
    accountKeypair.publicKey,
    decimals,
    owner,
    null,
    programId
  )

  const ixs = [createAccountIx, initializeMintAccountIx]

  return { ixs, accountKeypair }
}

const CreateSwapPool: FC = () => {
  const [tokenXMintAddress, setTokenXMintAddress] = useState(
    "3LXAChKq6sx8p7X2P3zFN6ua4qzCf6YMBajh2Px2sW5d"
  )
  const [tokenYMintAddress, setTokenYMintAddress] = useState(
    "HNttWpjdQykTo4Y7fZLgp9YTgDDDx85Ygt1cc2PA2cMY"
  )

  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()

  const handleSubmit = (event: any) => {
    event.preventDefault()
    handleCreateSwapPool()
  }

  const handleCreateSwapPool = async () => {
    if (!publicKey) {
      alert("Please connect your wallet!")
      return
    }

    const tx1 = new Web3.Transaction()

    // 1. Create token-swap-state account
    const tokenSwapStateAccountKeypair = Web3.Keypair.generate()
    const rent = await TokenSwap.getMinBalanceRentForExemptTokenSwap(connection)
    const createTokenSwapStateAccountIx = Web3.SystemProgram.createAccount({
      newAccountPubkey: tokenSwapStateAccountKeypair.publicKey,
      fromPubkey: publicKey,
      lamports: rent,
      space: TokenSwapLayout.span,
      programId: TOKEN_SWAP_PROGRAM_ID,
    })
    tx1.add(createTokenSwapStateAccountIx)

    // Find swap-pool-authority
    const [swapPoolAuthority] = await Web3.PublicKey.findProgramAddress(
      [tokenSwapStateAccountKeypair.publicKey.toBuffer()],
      TOKEN_SWAP_PROGRAM_ID
    )

    // Create token accounts for Token X and Token Y
    const tokenXMint = new Web3.PublicKey(tokenXMintAddress)
    const tokenYMint = new Web3.PublicKey(tokenYMintAddress)

    const tokenXATA = await token.getAssociatedTokenAddress(tokenXMint, swapPoolAuthority, true)
    const tokenXAccount = await connection.getAccountInfo(tokenXATA)
    if (tokenXAccount == null) {
      const createAtaIx = token.createAssociatedTokenAccountInstruction(
        publicKey,
        tokenXATA,
        swapPoolAuthority,
        tokenXMint
      )
      tx1.add(createAtaIx)
    }

    const tokenYATA = await token.getAssociatedTokenAddress(tokenYMint, swapPoolAuthority, true)
    const tokenYAccount = await connection.getAccountInfo(tokenYATA)
    if (tokenYAccount == null) {
      const createAtaIx = token.createAssociatedTokenAccountInstruction(
        publicKey,
        tokenYATA,
        swapPoolAuthority,
        tokenYMint
      )
      tx1.add(createAtaIx)
    }

    // Create pool-token mint
    const { ixs: createPoolTokenMintIxs, accountKeypair: poolTokenMintAccountKeypair } =
      await buildCreateMintIxs(connection, publicKey, swapPoolAuthority, 2)
    tx1.add(...createPoolTokenMintIxs)

    // Create pool-token account
    const poolTokenAccountKeypair = Web3.Keypair.generate()
    const rentExemptAccount = await token.getMinimumBalanceForRentExemptAccount(connection)
    const createPoolTokenAccountIx = Web3.SystemProgram.createAccount({
      fromPubkey: publicKey,
      newAccountPubkey: poolTokenAccountKeypair.publicKey,
      space: token.ACCOUNT_SIZE,
      lamports: rentExemptAccount,
      programId: token.TOKEN_PROGRAM_ID,
    })
    const initializeTokenAccountPoolIx = token.createInitializeAccountInstruction(
      poolTokenAccountKeypair.publicKey,
      poolTokenMintAccountKeypair.publicKey,
      publicKey
    )
    tx1.add(createPoolTokenAccountIx, initializeTokenAccountPoolIx)

    // Create pool-token-fee-account
    const tokenFeeATA = await token.getAssociatedTokenAddress(
      poolTokenMintAccountKeypair.publicKey,
      FEE_OWNER,
      true
    )

    const tokenFeeAccount = await connection.getAccountInfo(tokenFeeATA)
    if (tokenFeeAccount == null) {
      const createAtaIx = token.createAssociatedTokenAccountInstruction(
        publicKey,
        tokenFeeATA,
        FEE_OWNER,
        poolTokenMintAccountKeypair.publicKey
      )
      tx1.add(createAtaIx)
    }

    try {
      const txSig = await sendTransaction(tx1, connection, {
        signers: [
          tokenSwapStateAccountKeypair,
          poolTokenMintAccountKeypair,
          poolTokenAccountKeypair,
        ],
      })
      alert(`Transaction submitted: https://explorer.solana.com/tx/${txSig}?cluster=devnet`)
      console.log(`Transaction submitted: https://explorer.solana.com/tx/${txSig}?cluster=devnet`)

      await connection.confirmTransaction(txSig)
      console.log("transaction confirmed")
    } catch (e) {
      console.log(JSON.stringify(e))
      alert(JSON.stringify(e))
    }

    // Create swap pool
    const createSwapInstruction = TokenSwap.createInitSwapInstruction(
      new Web3.Account(tokenSwapStateAccountKeypair.secretKey), // Token swap state account
      swapPoolAuthority, // Swap pool authority
      tokenXATA, // Token A token account
      tokenYATA, // Token B token account
      poolTokenMintAccountKeypair.publicKey, // Swap pool token mint
      tokenFeeATA, // Token fee account
      poolTokenAccountKeypair.publicKey, // Swap pool token account
      token.TOKEN_PROGRAM_ID, // Token Program ID
      TOKEN_SWAP_PROGRAM_ID, // Token Swap Program ID
      0, // Trade fee numerator
      10000, // Trade fee denominator
      5, // Owner trade fee numerator
      10000, // Owner trade fee denominator
      0, // Owner withdraw fee numerator
      0, // Owner withdraw fee denominator
      20, // Host fee numerator
      100, // Host fee denominator
      CurveType.ConstantProduct // Curve type
    )

    const tx2 = new Web3.Transaction()
    tx2.add(createSwapInstruction)

    try {
      const txSig = await sendTransaction(tx2, connection)
      alert(`Transaction submitted: https://explorer.solana.com/tx/${txSig}?cluster=devnet`)
      console.log(`Transaction submitted: https://explorer.solana.com/tx/${txSig}?cluster=devnet`)

      await connection.confirmTransaction(txSig)
      console.log("transaction confirmed")
    } catch (e) {
      console.log(JSON.stringify(e))
      alert(JSON.stringify(e))
    }
  }

  return (
    <Box p={4} display={{ md: "flex" }} maxWidth="40rem" margin={2} justifyContent="center">
      <form onSubmit={handleSubmit}>
        <div style={{ padding: "0px 10px 5px 7px" }}>
          <FormControl isRequired>
            <Stack isInline spacing={10}>
              <Box>
                <FormLabel color="gray.200">Token X mint address</FormLabel>
                <Input
                  value={tokenXMintAddress}
                  onChange={(event) => setTokenXMintAddress(event.target.value)}
                  style={{
                    fontSize: 20,
                  }}
                  color="white"
                  disabled
                />
              </Box>
              <Box>
                <FormLabel color="gray.200">Token Y mint address</FormLabel>
                <Input
                  value={tokenYMintAddress}
                  onChange={(event) => setTokenYMintAddress(event.target.value)}
                  style={{
                    fontSize: 20,
                  }}
                  color="white"
                  disabled
                />
              </Box>
            </Stack>
            <Button width="full" mt={4} type="submit">
              Create Swap Pool
            </Button>
          </FormControl>
        </div>
      </form>
    </Box>
  )
}

export default CreateSwapPool
