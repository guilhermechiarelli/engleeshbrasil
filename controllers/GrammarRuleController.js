const GrammarRule = require("../models/GrammarRule");
const Post = require("../models/Post");

class GrammarRuleController {
  async create(req, res) {
    res.render("admin/add-grammarrule");
  }

  async list(req, res) {
    const grammar = await GrammarRule.find();
    res.render("grammar", { grammar });
  }

  store(req, res) {
    const { grammarname, grammarslug } = req.body;

    if (!grammarname || !grammarslug) {
      req.flash("error", "Please fill in the form correctly!");
      return res.redirect("/admin/grammarrule/add");
    }

    const NewGrammarRule = {
      name: req.body.grammarname,
      slug: req.body.grammarslug
    };

    new GrammarRule(NewGrammarRule)
      .save()
      .then(() => {
        req.flash("success", `${grammarname} has been added!`);
        res.redirect("/admin/grammarrule");
      })
      .catch(() => {
        req.flash("error", "There was an internal error while saving!");
      });
  }

  async update(req, res) {
    await GrammarRule.findByIdAndUpdate(req.params._id, req.body, {
      new: true
    })
      .then(grammar => {
        req.flash("success", `The category ${grammar.name} has been updated!`);
        return res.redirect("/admin/grammarrule");
      })
      .catch(err => {
        req.flash("error", `There was an error! ${err}.`);
        return res.redirect("/admin/grammarrule");
      });
  }

  async destroy(req, res) {
    await GrammarRule.findByIdAndDelete(req.params._id);
    req.flash("success", "The selected grammar rule has been deleted!");
    return res.redirect("/admin/grammarrule");
  }

  async oneGrammar(req, res) {
    const currentPage = req.query.p;
    await GrammarRule.findOne({ slug: req.params.slug })
      .then(async grammar => {
        if (grammar) {
          await Post.paginate(
            { grammarrule: grammar._id },
            {
              page: parseInt(currentPage) || 1,
              limit: 10,
              sort: { created_At: "desc" },
              populate: [
                { path: "category", select: "name slug" },
                { path: "grammarrule", select: "name" }
              ]
            }
          )
            .then(posts => {
              const page = posts.page;
              const pageCount = posts.pages;
              const limit = posts.limit;
              posts = posts.docs;
              res.render("app/newspergrammarrule", {
                posts,
                pagination: {
                  page: page,
                  limit: limit,
                  pageCount: pageCount
                }
              });
            })
            .catch(err => {
              req.flash(
                "error",
                "There was an error while loading the grammar page! Please try again soon."
              );
              return res.redirect("/grammar");
            });
        } else {
          req.flash("error", "Please choose a valid Grammar Rule!");
          return res.redirect("/grammar");
        }
      })
      .catch(err => {
        req.flash("error", err);
        return res.redirect("/grammar");
      });
  }

  async adminIndex(req, res) {
    const grammar = await GrammarRule.find();
    return res.render("admin/grammarrule", { grammar });
  }

  async editGrammar(req, res) {
    const grammar = await GrammarRule.find({ slug: req.params.slug });
    return res.render("admin/edit-grammar", { grammar });
  }
}

module.exports = new GrammarRuleController();
