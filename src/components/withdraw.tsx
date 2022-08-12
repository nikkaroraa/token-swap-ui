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
import { TOKEN_PROGRAM_ID } from "@solana/spl-token"

import {
  KRCYPT_TOKEN_MINT,
  SCROOGE_TOKEN_MINT,
  TOKEN_SWAP_STATE_ACCOUNT,
  SWAP_POOL_AUTHORITY,
  KRYPT_POOL_TOKEN_ACCOUNT,
  SCROOGE_POOL_TOKEN_ACCOUNT,
  POOL_TOKEN_MINT,
  POOL_TOKEN_FEE_ACCOUNT,
} from "constants/programs"

export const WithdrawSingleTokenType: FC = (props: {
  onInputChange?: (val: number) => void
  onMintChange?: (account: string) => void
}) => {
  const [poolTokenAmount, setAmount] = useState(0)
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()

  const handleWithdrawSubmit = (event: any) => {
    event.preventDefault()
    handleTransactionSubmit()
  }

  const handleTransactionSubmit = async () => {
    if (!publicKey) {
      alert("Please connect your wallet!")
      return
    }

    const poolMintInfo = await token.getMint(connection, POOL_TOKEN_MINT)

    const kryptATA = await token.getAssociatedTokenAddress(KRCYPT_TOKEN_MINT, publicKey)
    const scroogeATA = await token.getAssociatedTokenAddress(SCROOGE_TOKEN_MINT, publicKey)
    const tokenAccountPool = await token.getAssociatedTokenAddress(POOL_TOKEN_MINT, publicKey)

    const transaction = new Web3.Transaction()

    let account = await connection.getAccountInfo(tokenAccountPool)

    if (account == null) {
      const createATAInstruction = token.createAssociatedTokenAccountInstruction(
        publicKey,
        tokenAccountPool,
        publicKey,
        POOL_TOKEN_MINT
      )
      transaction.add(createATAInstruction)
    }

    const instruction = TokenSwap.withdrawAllTokenTypesInstruction(
      TOKEN,
      swapAuthority,
      publicKey,
      POOL_TOKEN_MINT,
      feeAccount,
      tokenAccountPool,
      poolKryptAccount,
      poolScroogeAccount,
      kryptATA,
      scroogeATA,
      TOKEN_SWAP_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      poolTokenAmount * 10 ** poolMintInfo.decimals,
      0,
      0
    )

    transaction.add(instruction)
    try {
      let txid = await sendTransaction(transaction, connection)
      alert(`Transaction submitted: https://explorer.solana.com/tx/${txid}?cluster=devnet`)
      console.log(`Transaction submitted: https://explorer.solana.com/tx/${txid}?cluster=devnet`)
    } catch (e) {
      console.log(JSON.stringify(e))
      alert(JSON.stringify(e))
    }
  }

  return (
    <Box p={4} display={{ md: "flex" }} maxWidth="32rem" margin={2} justifyContent="center">
      <form onSubmit={handleWithdrawSubmit}>
        <FormControl isRequired>
          <FormLabel color="gray.200">LP-Token Withdrawal Amount</FormLabel>
          <NumberInput
            max={1000}
            min={1}
            onChange={(valueString) => setAmount(parseInt(valueString))}
          >
            <NumberInputField id="amount" color="gray.400" />
          </NumberInput>
        </FormControl>
        <Button width="full" mt={4} type="submit">
          Withdraw
        </Button>
      </form>
    </Box>
  )
}
