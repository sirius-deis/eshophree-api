const express = require("express");
const userController = require("../controllers/user.controller");

const userRouter = express.Router();

userRouter.post("/signup", userController.signup);
// userRouter.post("/login");
// userRouter.get('/logout');

module.exports = userRouter;
