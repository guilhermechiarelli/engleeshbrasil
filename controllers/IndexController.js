class IndexController {
  index(req, res) {
    return res.render("index");
  }

  admin(req, res) {
    return res.render("admin/dashboard");
  }

  contact(req, res) {
    return res.render("contact");
  }
}

module.exports = new IndexController();
