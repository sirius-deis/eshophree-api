const User = require("../models/user.model");

exports.signup = async (req, res) => {
    if (req.body.password !== req.body.passwordConfirm) {
        return res.status(400).json({ message: "passwords are different" });
    }
    try {
        await User.create({
            name: req.body.name,
            surname: req.body.surname,
            email: req.body.email,
            password: req.body.password,
        });
        res.status(201).json("Account was successfully created");
    } catch (error) {
        return res.status(400).json("Something went wrong");
    }
};
