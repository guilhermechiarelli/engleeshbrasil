module.exports = (req, res, next) => {
  if (req.session && req.session.user) {
    res.locals.user = req.session.user;
    return next();
  }
  req.flash("error", "Faça seu login para acompanhar as notícias!");
  res.redirect("/signin");
};
