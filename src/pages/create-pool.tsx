import { Center, Box } from "@chakra-ui/react"
import type { NextPage } from "next"
import Head from "next/head"

import AppBar from "components/app-bar"
import CreateSwapPool from "components/create-swap-pool"

import styles from "styles/Home.module.css"

const Home: NextPage = () => {
  return (
    <div className={styles.App}>
      <Head>
        <title>Token Swap</title>
      </Head>
      <AppBar text="Create Swap Pool" />
      <Center>
        <Box>
          <CreateSwapPool />
        </Box>
      </Center>
    </div>
  )
}

export default Home
