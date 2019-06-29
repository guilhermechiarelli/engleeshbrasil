const User = require("../models/User");

class SessionController {
  create(req, res) {
    res.render("signin");
  }

  async login(req, res, next) {
    const { email, password } = req.body;

    if (!email || !password) {
      req.flash(
        "error",
        "Looks like you've forgotten to fill in some field! Please try again."
      );
      return res.redirect("/signin");
    }

    const user = await User.findOne({ email });

    if (!user) {
      req.flash("error", "Incorrect credentials!");
      return res.redirect("/signin");
    }

    if (!user.confirmed) {
      req.session.resend = true;
      req.flash(
        "error",
        "Usuário pendente! Verifique seu e-mail e confirme seu cadastro para realizar o login!"
      );
      return res.redirect("/signin");
    }

    if (!(await user.compareHash(password))) {
      req.flash("error", "Incorrect credentials!");
      return res.redirect("/signin");
    }

    if (user.isAdmin == 4444) {
      req.session.user = user;
      req.session.admin = user;
      return res.redirect("/admin/dashboard");
    }

    if (user.isAdmin == 88) {
      req.session.user = user;
      req.session.author = user;
      return res.redirect("/author/dashboard");
    }

    req.session.user = user;
    return res.redirect("/news");
  }

  destroy(req, res) {
    req.session.destroy(err => {
      if (err) {
        return res.redirect("/");
      }
      res.clearCookie(process.env.SESS_NAME);
      return res.redirect("/signin");
    });
  }
}

module.exports = new SessionController();
