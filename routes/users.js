/** @format */

var express = require("express");
var User = require(`../models/User`);
var auth = require(`../middlewares/auth`);
var router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

// render register form

router.get(`/register`, (req, res, next) => {
  let info = req.flash(`info`)[0];
  res.render(`register`, { info });
});

router.get(`/login`, (req, res, next) => {
  let info = req.flash(`info`)[0];
  res.render(`login`, { info });
});

// get user  register form

router.post(`/register`, (req, res, next) => {
  User.create(req.body, (err, user) => {
    if (err) {
      if (err.name === `ValidationError`) {
        req.flash(`info`, err.message);
        return res.redirect(`/users/register`);
      }
    }
    res.redirect(`/users/login`);
  });
});

// get user login

router.post(`/login`, (req, res, next) => {
  let { email, password } = req.body;

  // no  email password

  if (!email || !password) {
    req.flash(`info`, `email\password is required`);
    return res.redirect(`/users/login`);
  }
  User.findOne({ email }, (err, user) => {
    if (err) return next(err);

    // user as null
    if (!user) {
      req.flash(`info`, `you are not register`);
      return res.redirect(`/users/login`);
    }
    user.verifyPassword(password, (err, result) => {
      if (err) return next(err);

      // password as false
      if (!result) {
        req.flash(`info`, `invalid password`);
        return res.redirect(`/users/login`);
      }

      // persist session
      req.session.userId = user.id;
      res.redirect(`/collections`);
    });
  });
});

// protected path

router.use(auth.loggedInUser);

// upgrade plan

router.get(`/upgrade`, (req, res, next) => {
  res.render(`upgrade`);
});

router.get(`/:plan/upgrade`, (req, res, next) => {
  let plan = req.params.plan;
  let userId = req.session.userId;

  User.findOneAndUpdate(
    { userId },
    { $set: { plan: plan } },
    { new: true },
    (err, user) => {
      if (err) return next(err);
      res.redirect(`/collections`);
    }
  );
});

// logout

router.get(`/logout`, (req, res, next) => {
  req.session.destroy();
  res.clearCookie(`connect.sid`);

  res.redirect(`/`);
});
module.exports = router;
