import { FC } from "react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import Image from "next/image"

import styles from "styles/Home.module.css"

const AppBar: FC = () => {
    return (
        <div className={styles.AppHeader}>
            <Image
                alt="Solana"
                src="/images/solana.png"
                height={30}
                width={200}
            />
            <span>Token Swap</span>
            <WalletMultiButton />
        </div>
    )
}


export default AppBar