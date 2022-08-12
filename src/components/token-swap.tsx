import { Box } from "@chakra-ui/react"
import { FC } from "react"

import { DepositSingleTokenType } from "./deposit"
import { WithdrawSingleTokenType } from "./withdraw"
import { SwapToken } from "./swap"

const TokenSwapForm: FC = () => {
    return (
        <Box>
            <DepositSingleTokenType />
            <WithdrawSingleTokenType />
            <SwapToken />
        </Box>
    )
}


export default TokenSwapForm