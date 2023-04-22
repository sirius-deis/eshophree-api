const express = require("express");
const userController = require("../controllers/user.controller");
const isLoggedIn = require("../middleware/isLoggedIn");

const userRouter = express.Router();

userRouter.post("/signup", userController.signup);
userRouter.post("/login", userController.login);
// userRouter.get('/logout');

userRouter.route("/delete/:id").delete(isLoggedIn, userController.delete);

module.exports = userRouter;
