import { FC } from "react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import Image from "next/image"

import styles from "styles/Home.module.css"

interface Props {
  text: string
}

const AppBar: FC<Props> = (props: Props) => {
  return (
    <div className={styles.AppHeader}>
      <Image alt="Solana" src="/images/solana.png" height={30} width={200} />
      <span>{props.text}</span>
      <WalletMultiButton />
    </div>
  )
}

export default AppBar
