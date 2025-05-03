const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { validateProfileEditData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const validator = require("validator");

const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("User does not exist");
    }
    res.send(user);
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    // Validate the profile edit data
    if (!validateProfileEditData(req)) {
      throw new Error("Invalid Edit Request");
    }

    const loggedInUser = req.user;

    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
    //* No manual checks — just .save() and let Mongoose validate!
    await loggedInUser.save();

    res.json({
      message: ` ${loggedInUser.firstName}, your profile is updated successfully !!`,
      data: loggedInUser,
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

profileRouter.patch("/profile/changepassword", userAuth, async (req, res) => {
  try {
    //User should be logged in
    const loggedInUser = req.user;
    const { password, newPassword, confirmNewPassword } = req.body;

    //  Validate current password
    const isPasswordValid = await loggedInUser.validatePassword(password);
    if (!isPasswordValid) {
      throw new Error("Incorrect existing password !!");
    }

    // is new password strong enough
    if (!validator.isStrongPassword(newPassword)) {
      throw new Error("Please enter strong password");
    }

    // Ensure new and confirm match
    if (newPassword !== confirmNewPassword) {
      throw new Error("Passwords do not match !!");
    }

    // Ensure new password is not same as old
    if (password == newPassword) {
      throw new Error("Current and New password cannot be same !!");
    }

    // hash of new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    loggedInUser.password = newPasswordHash;
    await loggedInUser.save();

    res.json({
      message: ` ${loggedInUser.firstName}, your password is updated successfully !!`,
      data: loggedInUser,
    });

    // if both the hashes value are equal then edit the password field
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

module.exports = profileRouter;
