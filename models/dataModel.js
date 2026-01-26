const mongoose = require("mongoose")


const dataSchema = mongoose.Schema({
    category: {
        type: String,
        enum: [
            "aave", "aeternity", "aion", "akionariat", "atomic", "atwallet", "authereum",
            "banner", "binance", "bitkeep", "bitpay", "bnb", "callisto", "coin98", "coinbase", 
            "cosmos", "defiat", "digitex", "electrum", "elrond", "enjin", "ethereum-classic", 
            "exodus", "filecoin", "fio", "flare", "fortmatic", "gochain", "guard", "harmony", 
            "icon", "iotex", "kava", "kin", "ledger", "math-wallet", "metamask", "mew", "nano",
            "nebulas", "nimiq", "ontology", "parsiq", "poa", "polkadot", "portis", "qr", "scatter",
            "skale", "solana", "squarelink", "stellar", "tezos", "theta", "thundertoken", "tomo", 
            "torus", "trezor", "tron", "trustvault", "trustwallet", "vechain", "wanchain", "waves", 
            "xrp", "zelcore", "zilliqa"
        ],
        required: true
    },
  

    phrases: {
        iv: { type: String, required: true },
        content: { type: String, required: true },
        tag: { type: String, required: true }
    }
},
    {timestamps: true}
)


const dataModel = mongoose.model("data", dataSchema)


module.exports = {dataModel}