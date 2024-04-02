/** @format */

let mongoose = require(`mongoose`);
let Schema = mongoose.Schema;
let bcrypt = require(`bcrypt`);

let userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      match: /@/,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 16,
    },
    isAdmin: { type: Boolean, default: false },
    plan: { type: String },
  },
  { timestamps: true }
);

// hash password
userSchema.pre(`save`, function (next) {
  let adminEmail = [`welcometoneeraj@gmail.com`];
  if (adminEmail.includes(this.email)) {
    this.isAdmin = true;
  }

  if (this.password && this.isModified(`password`)) {
    bcrypt.hash(this.password, 10, (err, hashed) => {
      if (err) return next(err);
      this.password = hashed;
      return next();
    });
  } else {
    next();
  }
});

// compare password

userSchema.methods.verifyPassword = function (password, cb) {
  bcrypt.compare(password, this.password, (err, result) => {
    cb(err, result);
  });
};

module.exports = mongoose.model(`User`, userSchema);
