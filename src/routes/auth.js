const express = require("express");
const { validateSignUpData } = require("../utils/validation");

const authRouter = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const validator = require("validator");

authRouter.post("/signup", async (req, res) => {
  try {
    // Validation of data
    validateSignUpData(req);

    const { firstName, lastName, emailId, password } = req.body;

    // Encrypt the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Creating a new instance of the User model

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    //* Saves in the DB and returns a Promise

    const savedUser = await user.save();

    //* Create a JWT Token

    const token = await savedUser.getJWT();

    //* Add the token to cookie and send the response back to the user
    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
    });

    res.json({ message: "User added successfully !!", data: savedUser });
  } catch (err) {
    res.status(400).send("Error saving the user: " + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!validator.isEmail(emailId)) {
      throw new Error("Please enter Valid Email ID !");
    }

    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid Credentials !!");
    }

    const isPasswordValid = await user.validatePassword(password);

    if (isPasswordValid) {
      //* Create a JWT Token

      const token = await user.getJWT();

      //* Add the token to cookie and send the response back to the user
      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000),
      });
      res.send(user);
    } else {
      throw new Error("Invalid Credentials !!");
    }
  } catch (err) {
    res.status(400).send("Error Logging In: " + err.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.send("Logout Successful !!");
});

module.exports = authRouter;
