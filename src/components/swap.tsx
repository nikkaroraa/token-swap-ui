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

export const SwapToken: FC = () => {
  const [amount, setAmount] = useState(0)
  const [mint, setMint] = useState("")

  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()

  const handleSwapSubmit = (event: any) => {
    event.preventDefault()
    handleTransactionSubmit()
  }

  const handleTransactionSubmit = async () => {
    if (!publicKey) {
      alert("Please connect your wallet!")
      return
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
              onChange={(item) => setMint(item.currentTarget.value)}
            >
              <option style={{ color: "#282c34" }} value="option1">
                {" "}
                Krypt{" "}
              </option>
              <option style={{ color: "#282c34" }} value="option2">
                {" "}
                Scrooge{" "}
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
