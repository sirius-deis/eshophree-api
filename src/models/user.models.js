const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const { BCRYPT_SALT } = process.env;

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            maxlength: [32, "This field can't be longer than 32 characters"],
            required: [
                true,
                "name field can't be blank, please provide your real name",
            ],
        },
        surname: {
            type: String,
            trim: true,
            maxlength: [32, "This field can't be longer than 32 characters"],
            required: [
                true,
                "surname field can't be blank, please provide your real name",
            ],
        },
        email: {
            type: String,
            lowercase: true,
            unique: true,
            required: [
                true,
                "email field can't be blank, please provide an email address",
            ],
        },
        role: {
            type: String,
            enum: {
                values: ['user', 'moderator', 'admin'],
                message: props =>
                    `Value ${props.value} is incorrect. Please provide correct data`,
            },
            default: 'user',
        },
        password: {
            type: String,
            required: [
                true,
                "password field can't be blank, please provide a password",
            ],
            minlength: 8,
            select: false,
        },
        passwordChangedAt: {
            type: Date,
            select: false,
        },
        active: {
            type: Boolean,
            default: false,
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
    },
    {
        toJSON: {
            transform: (doc, ret) => {
                delete ret.__v;
            },
        },
    }
);

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password') || this.isNew) {
        return next();
    }
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, +BCRYPT_SALT || 10);
    next();
});

UserSchema.methods.checkPassword = async (assumedPassword, userPassword) => {
    return await bcrypt.compare(assumedPassword, userPassword);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
