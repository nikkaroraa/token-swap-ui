import {
  Box,
  Button,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react"
import { FC, useState } from "react"
import * as Web3 from "@solana/web3.js"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { TokenSwap, TOKEN_SWAP_PROGRAM_ID } from "@solana/spl-token-swap"
import * as token from "@solana/spl-token"

import {
  KRCYPT_TOKEN_MINT,
  SCROOGE_TOKEN_MINT,
  TOKEN_SWAP_STATE_ACCOUNT,
  SWAP_POOL_AUTHORITY,
  KRYPT_POOL_TOKEN_ACCOUNT,
  SCROOGE_POOL_TOKEN_ACCOUNT,
  POOL_TOKEN_MINT,
} from "constants/programs"

export const DepositSingleTokenType: FC = () => {
  const [poolTokenAmount, setAmount] = useState(0)

  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()

  const handleSubmit = (event: any) => {
    event.preventDefault()
    handleTransactionSubmit()
  }

  const handleTransactionSubmit = async () => {
    if (!publicKey) {
      alert("Please connect your wallet!")
      return
    }

    const kryptATA = await token.getAssociatedTokenAddress(KRCYPT_TOKEN_MINT, publicKey)
    const scroogeATA = await token.getAssociatedTokenAddress(SCROOGE_TOKEN_MINT, publicKey)

    const tx = new Web3.Transaction()

    const userPoolTokenATA = await token.getAssociatedTokenAddress(POOL_TOKEN_MINT, publicKey)
    const userPoolTokenAccount = await connection.getAccountInfo(userPoolTokenATA)
    if (userPoolTokenAccount == null) {
      const createAtaIx = token.createAssociatedTokenAccountInstruction(
        publicKey,
        userPoolTokenATA,
        publicKey,
        POOL_TOKEN_MINT
      )
      tx.add(createAtaIx)
    }

    const poolTokenMint = await token.getMint(connection, POOL_TOKEN_MINT)

    const depositIx = TokenSwap.depositAllTokenTypesInstruction(
      TOKEN_SWAP_STATE_ACCOUNT,
      SWAP_POOL_AUTHORITY,
      publicKey,
      kryptATA,
      scroogeATA,
      KRYPT_POOL_TOKEN_ACCOUNT,
      SCROOGE_POOL_TOKEN_ACCOUNT,
      POOL_TOKEN_MINT,
      userPoolTokenATA,
      TOKEN_SWAP_PROGRAM_ID,
      token.TOKEN_PROGRAM_ID,
      poolTokenAmount * 10 ** poolTokenMint.decimals,
      100e9,
      100e9
    )
    tx.add(depositIx)

    try {
      let txSig = await sendTransaction(tx, connection)
      alert(`Transaction submitted: https://explorer.solana.com/tx/${txSig}?cluster=devnet`)
      console.log(`Transaction submitted: https://explorer.solana.com/tx/${txSig}?cluster=devnet`)
    } catch (e) {
      console.log(JSON.stringify(e))
      alert(JSON.stringify(e))
    }
  }

  return (
    <Box p={4} display={{ md: "flex" }} maxWidth="32rem" margin={2} justifyContent="center">
      <form onSubmit={handleSubmit}>
        <div style={{ padding: "0px 10px 5px 7px" }}>
          <FormControl isRequired>
            <FormLabel color="gray.200">
              LP-Tokens to receive for deposit to Liquidity Pool
            </FormLabel>
            <NumberInput
              onChange={(valueString) => setAmount(parseInt(valueString))}
              style={{
                fontSize: 20,
              }}
              placeholder="0.00"
            >
              <NumberInputField id="amount" color="gray.400" />
            </NumberInput>
            <Button width="full" mt={4} type="submit">
              Deposit
            </Button>
          </FormControl>
        </div>
      </form>
    </Box>
  )
}
