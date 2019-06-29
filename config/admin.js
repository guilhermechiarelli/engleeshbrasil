module.exports = (req, res, next) => {
  if (req.session.user && req.session.user.isAdmin == 4444) {
    return next();
  }

  return res.render("error");
};
