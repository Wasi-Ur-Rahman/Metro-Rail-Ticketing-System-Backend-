const express = require("express");
const bodyParser = require("body-parser");
const Users = require("./models/User");
const Wallets = require("./models/Wallet");
const app = express();
const mongoose = require("mongoose");

const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT } = process.env;

const dbUrl = `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/`;

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("Connected to database!");
  })
  .catch((error) => {
    console.log("Connection failed!", error);
    process.exit();
  });

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

app.post('/api/users', (req,res) => {
  try {
    const user = new Users({
        user_id: req.body.user_id,
        user_name: req.body.user_name,
        balance: req.body.balance
    });
    const wallet = new Wallets({
      wallet_id: user.user_id,
      balance: user.balance,
      wallet_user: {
          user_id: user.user_id,
          user_name: user.user_name
      }
  });
  wallet.save();
  user.save();
    res.status(201).json({
        user_id: user.user_id,
        user_name: user.user_name,
        balance: user.balance
    });
} catch (err) {

}
})

const stationRouter = require("./routes/stations");
app.use("/", stationRouter);

const trainRouter = require("./routes/trains");
app.use("/", trainRouter);

const walletRouter = require("./routes/wallets");
app.use("/", walletRouter);

app.listen(8000, () => {
    console.log("server is running on port 8000");
});
