import {
  Box,
  Select,
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
  KRYPT_TOKEN_MINT,
  SCROOGE_TOKEN_MINT,
  TOKEN_SWAP_STATE_ACCOUNT,
  SWAP_POOL_AUTHORITY,
  POOL_TOKEN_MINT,
  POOL_TOKEN_FEE_ACCOUNT,
  KRYPT_POOL_TOKEN_ACCOUNT,
  SCROOGE_POOL_TOKEN_ACCOUNT,
} from "constants/programs"

const SWAP_OPTIONS = {
  KRYPT: "KRYPT",
  SCROOGE: "SCROOGE",
}

export const SwapToken: FC = () => {
  const [amount, setAmount] = useState(0)

  const [sourceToken, setSourceToken] = useState("")

  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()

  const onSwapOptionChange = (item: any) => {
    setSourceToken(item.currentTarget.value)
  }

  const handleSwapSubmit = (event: any) => {
    event.preventDefault()
    handleTransactionSubmit()
  }

  const handleTransactionSubmit = async () => {
    if (!publicKey) {
      alert("Please connect your wallet!")
      return
    }

    const kryptTokenMint = await token.getMint(connection, KRYPT_TOKEN_MINT)
    const scroogeTokenMint = await token.getMint(connection, SCROOGE_TOKEN_MINT)

    const userKryptATA = await token.getAssociatedTokenAddress(KRYPT_TOKEN_MINT, publicKey)
    const userScroogeATA = await token.getAssociatedTokenAddress(SCROOGE_TOKEN_MINT, publicKey)

    const tx = new Web3.Transaction()

    if (sourceToken === SWAP_OPTIONS.KRYPT) {
      const swapIx = TokenSwap.swapInstruction(
        TOKEN_SWAP_STATE_ACCOUNT,
        SWAP_POOL_AUTHORITY,
        publicKey,
        userKryptATA,
        KRYPT_POOL_TOKEN_ACCOUNT,
        SCROOGE_POOL_TOKEN_ACCOUNT,
        userScroogeATA,
        POOL_TOKEN_MINT,
        POOL_TOKEN_FEE_ACCOUNT,
        null,
        TOKEN_SWAP_PROGRAM_ID,
        token.TOKEN_PROGRAM_ID,
        amount * 10 ** kryptTokenMint.decimals,
        0
      )
      tx.add(swapIx)
    } else if (sourceToken === SWAP_OPTIONS.SCROOGE) {
      const swapIx = TokenSwap.swapInstruction(
        TOKEN_SWAP_STATE_ACCOUNT,
        SWAP_POOL_AUTHORITY,
        publicKey,
        userScroogeATA,
        SCROOGE_POOL_TOKEN_ACCOUNT,
        KRYPT_POOL_TOKEN_ACCOUNT,
        userKryptATA,
        POOL_TOKEN_MINT,
        POOL_TOKEN_FEE_ACCOUNT,
        null,
        TOKEN_SWAP_PROGRAM_ID,
        token.TOKEN_PROGRAM_ID,
        amount * 10 ** scroogeTokenMint.decimals,
        0
      )
      tx.add(swapIx)
    }

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
      <form onSubmit={handleSwapSubmit}>
        <FormControl isRequired>
          <FormLabel color="gray.200">Swap Amount</FormLabel>
          <NumberInput
            max={1000}
            min={1}
            onChange={(valueString) => setAmount(parseInt(valueString))}
          >
            <NumberInputField id="amount" color="gray.400" />
          </NumberInput>
          <div style={{ display: "felx" }}>
            <Select
              display={{ md: "flex" }}
              justifyContent="center"
              placeholder="Token to Swap"
              color="white"
              variant="outline"
              dropShadow="#282c34"
              onChange={onSwapOptionChange}
            >
              <option style={{ color: "#282c34" }} value={SWAP_OPTIONS.KRYPT}>
                Krypt
              </option>
              <option style={{ color: "#282c34" }} value={SWAP_OPTIONS.SCROOGE}>
                Scrooge
              </option>
            </Select>
          </div>
        </FormControl>
        <Button width="full" mt={4} type="submit">
          Swap ⇅
        </Button>
      </form>
    </Box>
  )
}
