let express = require("express");
let app = express();
let morgan = require("morgan");
let bodyParser = require("body-parser");
let User = require("./models/user");
let jwt = require("jsonwebtoken");
let checkAuth = require("./middle-ware/checkAuth");
let bcryptjs = require("bcryptjs");
let mongoose = require("mongoose");
let multer = require("multer");
let Order = require("./models/orders");
let Product = require("./models/products");
let url = "mongodb://moe:pw1234@ds151614.mlab.com:51614/rest-shop";
//app.use(bodyParser.raw({ type: "*/*" }));

mongoose.connect(
  url,
  { useNewUrlParser: true }
);
let db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
  // we're connected!
});
mongoose.set('useCreateIndex', true);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/productPhotos", express.static("productPhotos"));
app.use("/UserProfile/userPhotos", express.static("UserProfile/userPhotos"));

let productStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./productPhotos");
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  }
});
let userStorage = multer.diskStorage({
  destination: (req,file,cb)=>{
    cb(null, "./UserProfile/userPhotos")
  },
  filename: (req,file,cb)=>{
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname)
  }
})
let fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
let uploadProImg = multer({
  storage: productStorage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});
let uploadUserImg = multer({
  storage: userStorage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter

})

app.use(morgan("dev"));



app.get("/products", (req, res, next) => {
  Product.find()
    .populate("createdBy")
    .exec((err, products) => {
      if (err) {
        res.send(
          JSON.stringify({ error: true, message: "error getting products" })
        );
      } else {
        res.send(
          JSON.stringify({
            success: true,
            message: "products found successfully",
            products
          })
        );
      }
    });
});

app.post(
  "/addProduct",
  checkAuth,
  uploadProImg.single("productImage"),
  (req, res, next) => {
    let token = req.headers.authorization.split(" ")[1];
    let decoded = jwt.decode(token, "secret");

    let product = new Product();
    product.category = req.body.category;
    product.type = req.body.type;
    product.model = req.body.model;
    product.condition = req.body.condition;
    product.description = req.body.description;
    product.price = req.body.price;
    product.productImage = req.file.path;
    product.quantity = req.body.quantity;
    product.shipment = req.body.shipment;
    product.createdBy = decoded.id;
    console.log(product);
    product.save((err, product) => {
      if (err) {
        res.send(
          JSON.stringify({
            error: err,
            message: "error saving product"
          })
        );
      } else {
       
        res.send(
          JSON.stringify({
            success: true,
            message: "successfully saved the product",
            product
          })
        );
      }
    });
  }
);

app.delete("/product/:id", checkAuth, (req, res, next) => {
  Product.deleteOne({ _id: req.params.id }, err => {
    if (err) {
      res.send(
        JSON.stringify({ error: err, message: "error deleting product" })
      );
    } else {
      res.send(
        JSON.stringify({
          success: true,
          message: "product deleted successfully"
        })
      );
    }
  });
});

app.get("/orders", (req, res, next) => {
  Order.find()
    .populate("product")
    .exec((err, orders) => {
      if (err) {
        res.send(
          JSON.stringify({ error: err, message: "error finding orders" })
        );
      } else {
        res.send(
          JSON.stringify({
            success: true,
            message: "orders found successfully",
            orders
          })
        );
      }
    });
});

app.delete("/order/:id", checkAuth, (req, res, next) => {
  Order.deleteOne({ _id: req.params.id }, err => {
    if (err) {
      res.send(
        JSON.stringify({ error: true, message: "error deleting order" })
      );
    } else {
      res.send(
        JSON.stringify({
          success: true,
          message: " order successfully deleted"
        })
      );
    }
  });
});
 
app.post("/signup", 
uploadUserImg.single("userImage"), 
(req, res, next) => {
  User.findOne({ email: req.body.email }).exec((err, user) => {
    if (err) {
      res.send(JSON.stringify({ error: err, message: "error finding user" }));
    } else {
      if (user !== null && user !== undefined) {
        res.send(
          JSON.stringify({
            message: "user already exist"
          })
        );
      } else {
        bcryptjs.hash(req.body.passWord, 10, (err, hash) => {
          if (err) {
            res.send(JSON.stringify({ error: err }));
          } else {
            let user = new User();
            user.email = req.body.email;
            user.userName = req.body.userName;
            user.passWord = hash;
            user.city = req.body.city;
            user.userImage = req.file.path;
            user.country = req.body.country;
            user.summary = req.body.summary;

            user.save((err, user) => {
              if (err) {
                res.send(
                  JSON.stringify({ error: err, message: "error saving user" })
                );
              } else {
                res.send(
                  JSON.stringify({
                    success: true,
                    message: "user saved successfully",
                    user
                  })
                );
              }
            });
          }
        });
      }
    }
  });
});

app.post("/login", (req, res, next) => {
  User.findOne({ email: req.body.email }).exec((err, user) => {
    if (err) {
      res.send(JSON.stringify({ error: err, message: "Auth failed" }));
    } else {
      if (user !== null && user !== undefined) {
        bcryptjs.compare(req.body.passWord, user.passWord, (err, result) => {
          if (err) {
            res.send(JSON.stringify({ error: err, message: "Auth failed" }));
            return;
          }
          if (result) {
            let token = jwt.sign(
              {
                email: user.email,
                id: user._id
              },
              "secret",
              {
                expiresIn: "1h"
              }
            );
            res.send(
              JSON.stringify({
                success: true,
                message: "Auth succeed",
                token: token,
                id: user._id
              })
            );
          } else {
            res.send(JSON.stringify({ error: err, message: "Auth failed" }));
          }
        });
      } else {
        res.status(402).send(JSON.stringify({ message: "Auth failed" }));
      }
    }
  });
});

app.post("/addOrder", checkAuth, (req, res, next) => {
  let order = new Order();
  order.product = req.body.id;

  order.save((err, order) => {
    if (err) {
      res.send(JSON.stringify({ error: err, message: "error saving order" }));
    } else {
      res.send(
        JSON.stringify({
          success: true,
          message: "successfully saved the order"
        })
      );
    }
  });
});

app.get("/user/:id", (req, res, next) => {
  User.findOne({ _id: req.params.id }).exec((err, user) => {
    if (err) {
      res.send(JSON.stringify({ message: "error finding user" }));
    } else {
      res.send(JSON.stringify({ message: "successfully done",
      user }));
      console.log(user)
    }
  });
});
// Handling Error
app.use((req, res, next) => {
  let error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.send(
    JSON.stringify({
      message: error.message
    })
  );
});

app.listen(4000, () => {
  console.log("listening on port 4000");
});
