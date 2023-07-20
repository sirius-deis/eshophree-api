const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const { BCRYPT_SALT } = process.env;

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      maxlength: [32, "This field can't be longer than 32 characters"],
    },
    surname: {
      type: String,
      maxlength: [32, "This field can't be longer than 32 characters"],
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "email field can't be blank, please provide an email address"],
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'moderator', 'admin'],
        message: (props) => `Value ${props.value} is incorrect. Please provide correct data`,
      },
      default: 'user',
    },
    password: {
      type: String,
      required: [true, "password field can't be blank, please provide a password"],
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
    pictureId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Image',
    },
  },
  {
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
      },
    },
    timestamps: true,
  },
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

UserSchema.methods.checkPassword = async (assumedPassword, userPassword) =>
  await bcrypt.compare(assumedPassword, userPassword);

const User = mongoose.model('User', UserSchema);

module.exports = User;
