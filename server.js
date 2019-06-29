//require("dotenv").config();

const express = require("express");
const handlebars = require("express-handlebars");
const path = require("path");
const mongoose = require("mongoose");
const databaseConfig = require("./config/database");
const flash = require("connect-flash");
const session = require("express-session");
const paginate = require("handlebars-paginate");
const handleb = require("handlebars");
const FIVE_HOURS = 1000 * 60 * 60 * 5;
const { SESS_LIFETIME = FIVE_HOURS } = process.env;
const IN_PROD = process.env.NODE_ENV === "production";
const MongoStore = require("connect-mongo")(session);

class App {
  constructor() {
    this.express = express();
    this.middlewares();
    this.database();
    this.views();
    this.routes();
  }

  middlewares() {
    this.express.use(express.urlencoded({ extended: false }));
    this.express.use(express.static(path.join(__dirname, "/public")));

    this.express.use(
      session({
        cookie: {
          maxAge: SESS_LIFETIME,
          secure: IN_PROD,
          sameSite: true
        },
        name: process.env.SESS_NAME,
        secret: process.env.SESS_SECRET,
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({ mongooseConnection: mongoose.connection })
      })
    );

    this.express.use(flash());
  }

  database() {
    mongoose.connect(databaseConfig.uri, {
      useCreateIndex: true,
      useNewUrlParser: true
    });
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
