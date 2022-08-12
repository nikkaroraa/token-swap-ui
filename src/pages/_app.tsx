import type { AppProps } from "next/app"
import { ChakraProvider } from "@chakra-ui/react"

import WalletProvider from "providers/wallet"
import "../styles/globals.css"

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <ChakraProvider>
            <WalletProvider>
                <Component {...pageProps} />
            </WalletProvider>
        </ChakraProvider>
    )
}

export default MyApp
