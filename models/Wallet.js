const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
    wallet_id: {
        type: Number,
        required: true
    },
    balance: {
        type: Number,
        required: true
    },
    wallet_user: {
        user_id: {
            type: Number,
            required: true
        },
        user_name: {
            type: String,
            required: true
        }
    }
});

module.exports = mongoose.model("Wallets", walletSchema);