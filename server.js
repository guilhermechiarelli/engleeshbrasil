//require("dotenv").config();

const express = require("express");
const handlebars = require("express-handlebars");
const path = require("path");
const mongoose = require("mongoose");
const databaseConfig = require("./config/database");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const paginate = require("handlebars-paginate");
const handleb = require("handlebars");
//const IN_PROD = process.env.NODE_ENV === "production";
const MongoStore = require("connect-mongo")(session);

class App {
  constructor() {
    this.express = express();
    this.database();
    this.middlewares();
    this.views();
    this.routes();
  }

  database() {
    mongoose.connect(databaseConfig.uri, {
      useCreateIndex: true,
      useNewUrlParser: true
    });

    mongoose.Promise = global.Promise;
  }

  middlewares() {
    this.express.use(express.urlencoded({ extended: false }));
    this.express.use(express.static(path.join(__dirname, "/public")));

    this.express.use(cookieParser());
    this.express.use(
      session({
        name: process.env.SESS_NAME,
        secret: process.env.SESS_SECRET,
        resave: true,
        saveUninitialized: true,
        store: new MongoStore({
          mongooseConnection: mongoose.connection,
          ttl: 5 * 60 * 60
        })
      })
    );

    this.express.use(flash());
  }

  views() {
    this.express.set("view engine", "hbs");
    this.express.engine(
      "hbs",
      handlebars({
        extname: "hbs",
        defaultLayout: __dirname + "/views" + "/default" + "/main",
        layoutsDir: __dirname + "views"
      })
    );
    handleb.registerHelper("paginate", paginate);
  }

  routes() {
    this.express.use(require("./routes"));
  }
}

module.exports = new App().express;
