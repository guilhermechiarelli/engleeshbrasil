const express = require("express");
const routes = express.Router();
const IndexController = require("./controllers/IndexController");
const SessionController = require("./controllers/SessionController");
const UserController = require("./controllers/UserController");
const NewsController = require("./controllers/NewsController");
const PostController = require("./controllers/PostController");
const TempPostController = require("./controllers/TempPostController");
const CategoryController = require("./controllers/CategoryController");
const GrammarRuleController = require("./controllers/GrammarRuleController");
const authMiddleware = require("./config/auth");
const guestMiddleware = require("./config/guest");
const adminMiddleware = require("./config/admin");
const authorMiddleware = require("./config/author");

routes.use((req, res, next) => {
  res.locals.flashSuccess = req.flash("success");
  res.locals.flashError = req.flash("error");
  res.locals.user = req.session.user || null;
  res.locals.admin = req.session.admin || null;
  res.locals.resend = req.session.resend || null;
  res.locals.author = req.session.author || null;
  return next();
});

routes.get("/", IndexController.index);

routes.get("/signin", guestMiddleware, SessionController.create);
routes.post("/signin", guestMiddleware, SessionController.login);
routes.get("/signup", guestMiddleware, UserController.create);
routes.post("/signup", guestMiddleware, UserController.store);
routes.get("/logout", authMiddleware, SessionController.destroy);
routes.get("/news", NewsController.index);
routes.get("/categories", CategoryController.list);
routes.get("/grammar", GrammarRuleController.list);
routes.get("/contact", IndexController.contact);

routes.get(
  "/confirmation/:token",
  guestMiddleware,
  UserController.confirmation
);
routes.get("/forgot", guestMiddleware, UserController.forgotPassword);
routes.post("/forgot", guestMiddleware, UserController.forgotPasswordEmail);
routes.get("/forgot/:token", guestMiddleware, UserController.resetPassword);
routes.post(
  "/forgot/:token",
  guestMiddleware,
  UserController.resetPasswordUpdate
);
routes.get("/resend", guestMiddleware, UserController.resend);
routes.post("/resend", guestMiddleware, UserController.resendEmail);

routes.get("/app/news/:slug", authMiddleware, NewsController.postPage);
routes.get("/app/profile", authMiddleware, UserController.index);
routes.post("/app/profile/:_id", authMiddleware, UserController.update);
routes.get(
  "/app/categories/:slug",
  authMiddleware,
  CategoryController.oneCategory
);
routes.get(
  "/app/grammar/:slug",
  authMiddleware,
  GrammarRuleController.oneGrammar
);

routes.get("/admin/dashboard", adminMiddleware, IndexController.admin);
routes.get("/admin/news", adminMiddleware, NewsController.adminIndex);
routes.get(
  "/admin/news/edit/:slug",
  adminMiddleware,
  NewsController.adminPostPage
);
routes.post("/admin/news/delete/:_id", adminMiddleware, PostController.destroy);
routes.post("/admin/news/update/:_id", adminMiddleware, PostController.update);
routes.get(
  "/admin/pendding/posts",
  adminMiddleware,
  TempPostController.penddingPosts
);
routes.get(
  "/admin/pendding/posts/:slug",
  adminMiddleware,
  TempPostController.checkPost
);
routes.post("/admin/approved/post/:_id", adminMiddleware, PostController.store);
routes.get("/admin/categories", adminMiddleware, CategoryController.adminIndex);
routes.get("/admin/category/add", adminMiddleware, CategoryController.create);
routes.get(
  "/admin/category/edit/:slug",
  adminMiddleware,
  CategoryController.editCategory
);
routes.post(
  "/admin/category/update/:_id",
  adminMiddleware,
  CategoryController.update
);
routes.post(
  "/admin/category/delete/:_id",
  adminMiddleware,
  CategoryController.destroy
);
routes.get(
  "/admin/grammarrule/",
  adminMiddleware,
  GrammarRuleController.adminIndex
);
routes.get(
  "/admin/grammarrule/edit/:slug",
  adminMiddleware,
  GrammarRuleController.editGrammar
);
routes.post(
  "/admin/grammarrule/update/:_id",
  adminMiddleware,
  GrammarRuleController.update
);
routes.post(
  "/admin/grammarrule/delete/:_id",
  adminMiddleware,
  GrammarRuleController.destroy
);
routes.get(
  "/admin/grammarrule/add",
  adminMiddleware,
  GrammarRuleController.create
);
routes.post(
  "/admin/category/add/new",
  adminMiddleware,
  CategoryController.store
);
routes.post(
  "/admin/grammarrule/add/new",
  adminMiddleware,
  GrammarRuleController.store
);
routes.post(
  "/admin/category/remove/:_id",
  adminMiddleware,
  CategoryController.destroy
);
routes.post(
  "/admin/grammarrule/remove/:_id",
  adminMiddleware,
  GrammarRuleController.destroy
);

routes.get("/author/dashboard", authorMiddleware, TempPostController.index);
routes.get("/author/edit/:slug", authorMiddleware, TempPostController.editPost);
routes.post("/author/update/:_id", authorMiddleware, TempPostController.update);
routes.post(
  "/author/delete/:_id",
  authorMiddleware,
  TempPostController.destroy
);

routes.get("/author/post", authorMiddleware, TempPostController.create);
routes.post("/author/post/add", authorMiddleware, TempPostController.store);
routes.use((req, res) => {
  res.status(404);
  res.render("error");
});

module.exports = routes;
