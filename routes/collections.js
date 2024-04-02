/** @format */

let express = require(`express`);
let router = express.Router();
let path = require(`path`);
let multer = require(`multer`);
let Collection = require(`../models/Collection`);
let User = require("../models/User");
let fs = require(`fs`);
let auth = require(`../middlewares/auth`);
const { collection } = require("../models/Collection");

let mediaPath = path.join(__dirname + `../` + `../public/media`);

// set storage

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, mediaPath);
  },

  filename: function (req, file, cb) {
    let fileExtension = Date.now() + `_` + file.originalname;
    cb(null, fileExtension);
  },
});

let upload = multer({ storage: storage });

// protected path

router.use(auth.loggedInUser);

// add collection
router.get(`/new`, (req, res, next) => {
  res.render(`addCollection`);
});

// upload file

router.post(
  `/uploadFile`,
  upload.fields([
    { name: `audio`, maxCount: 1 },
    { name: `avatar`, maxCount: 1 },
  ]),
  (req, res, next) => {
    let { audio, avatar } = req.files;
    req.body.audio = audio[0].filename;
    req.body.avatar = avatar[0].filename;
    Collection.create(req.body, (err, collection) => {
      if (err) return next(err);
      res.redirect(`/collections`);
    });
  }
);

// find collection
router.get(`/`, (req, res, next) => {
  User.findById(req.session.userId, (err, user) => {
    if (err) return next(err);
    if (user.isAdmin) {
      res.redirect(`/collections/premium`);
    } else {
      // user's plan
      if (user.plan === `free`) {
        res.redirect(`/collections/free`);
      } else if (user.plan === `vip`) {
        res.redirect(`/collections/vip`);
      } else {
        res.redirect(`/collections/premium`);
      }
    }
  });
});

// find collection
router.get(`/free`, (req, res, next) => {
  Collection.find({ plan: `free` }, (err, collection) => {
    if (err) return next(err);
    res.render(`dashboard`, { collection });
  });
});

// vip
router.get(`/vip`, (req, res, next) => {
  Collection.find({ plan: { $in: ["free", "vip"] } }, (err, collection) => {
    if (err) return next(err);
    // console.log(collection, `pp`);
    res.render(`dashboard`, { collection });
  });
});

// premium
router.get(`/premium`, (req, res, next) => {
  Collection.find({}, (err, collection) => {
    if (err) return next(err);
    res.render(`dashboard`, { collection });
  });
});

// edit collection

router.get(`/:id/edit`, (req, res, next) => {
  let id = req.params.id;

  Collection.findById(id, (err, item) => {
    if (err) return next(err);
    res.render(`editCollection`, { item });
  });
});

router.post(
  `/:id/edit`,
  upload.fields([
    { name: `audio`, maxCount: 1 },
    { name: `avatar`, maxCount: 1 },
  ]),
  (req, res, next) => {
    let id = req.params.id;
    let { audio, avatar } = req.files;
    req.body.audio = audio[0].filename;
    req.body.avatar = avatar[0].filename;
    Collection.findByIdAndUpdate(
      id,
      req.body,
      { new: true },
      (err, collection) => {
        if (err) return next(err);
        // console.log(err, collection, `fffff`);
        res.redirect(`/collections`);
      }
    );
  }
);

// delete item

router.get(`/:id/delete`, (req, res, next) => {
  let id = req.params.id;
  Collection.findByIdAndDelete(id, (err, item) => {
    if (err) return next(err);

    let audioPath = mediaPath + `/${item.audio}`;
    let avatarPath = mediaPath + `/${item.avatar}`;

    fs.unlink(audioPath, err => {
      if (err) return next(err);
      fs.unlink(avatarPath, err => {
        if (err) return next(err);
        res.redirect(`/collections`);
      });
    });
  });
});

// like item

router.get(`/:id/like`, (req, res, next) => {
  let id = req.params.id;
  Collection.findById(id, (err, item) => {
    if (err) return next(err);
    if (item.likes.includes(req.session.userId)) {
      Collection.findByIdAndUpdate(
        id,
        {
          $pull: { likes: req.session.userId },
        },
        { new: true },
        (err, item) => {
          if (err) return next(err);
          res.redirect(`/collections`);
        }
      );
    } else {
      Collection.findByIdAndUpdate(
        id,
        { $push: { likes: req.session.userId } },
        { new: true },
        (err, item) => {
          if (err) return next(err);
          res.redirect(`/collections`);
        }
      );
    }
  });
});
module.exports = router;
