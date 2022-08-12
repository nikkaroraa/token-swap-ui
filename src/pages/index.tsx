import { Center, Box} from "@chakra-ui/react"
import type { NextPage } from "next"
import Head from "next/head"

import AppBar from "components/app-bar"
import Airdrop from "components/airdrop"
import TokenSwapForm from "components/token-swap"

import styles from "styles/Home.module.css"

const Home: NextPage = () => {
    return (
        <div className={styles.App}>
            <Head>
                <title>Token Swap</title>
            </Head>
            <AppBar />
            <Center>
                <Box>
                    <Airdrop />
                    <TokenSwapForm />
                </Box>
            </Center>
        </div>
    )
}

export default Home
