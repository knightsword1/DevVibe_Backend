const express = require("express");
const connectDB = require("./config/database");
const app = express();

const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const cors = require("cors");

// dotenv
require("dotenv").config();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

//* express.json() reads the json object -> converts it into javascript object -> gives the javascript object back to req.body

//* NEVER TRUST req.body. Always do validation

// Get user by email
app.get("/user", async (req, res) => {
  const userEmail = req.body.emailId;
  try {
    const users = await User.find({ emailId: userEmail });
    if (users.length === 0) {
      res.status(404).send("User not found");
    } else {
      res.send(users);
    }
  } catch (error) {
    res.status(400).send("Something went wrong!!");
  }
});

//* Update data of the user
app.patch("/user/:userId", async (req, res) => {
  const userId = req.params?.userId;
  const data = req.body;

  try {
    //* updation allowed in following fields only :
    const ALLOWED_UPDATES = ["skills", "age", "gender", "about", "photoUrl"];
    const isUpdateAllowed = Object.keys(data).every((k) =>
      ALLOWED_UPDATES.includes(k)
    );

    if (!isUpdateAllowed) {
      throw new Error("Update not allowed");
    }
    const user = await User.findByIdAndUpdate({ _id: userId }, data, {
      returnDocument: "before",
      runValidators: true,
    });
    console.log(user);
    res.send("User updated successfully !!");
  } catch (error) {
    res.status(400).send("Update Failed !!" + error.message);
  }
});

//* First connect with database then connect with the server

connectDB()
  .then(() => {
    console.log("DB connection established ...");
    app.listen(process.env.PORT, () =>
      console.log("Server is successfully listening on port 7777....")
    );
  })
  .catch((err) => {
    console.error("DB cannot be connected!!");
  });
