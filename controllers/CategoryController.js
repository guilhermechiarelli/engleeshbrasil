const Category = require("../models/Category");
const Post = require("../models/Post");

class CategoryController {
  async list(req, res) {
    const categories = await Category.find();
    if (categories) {
      return res.render("categories", { categories });
    } else {
      req.flash(
        "error",
        "There was an error while loading the categories! Please try again soon."
      );
      res.redirect("/categories");
    }
  }

  create(req, res) {
    res.render("admin/add-category");
  }

  store(req, res) {
    const { categoryname, categoryslug } = req.body;

    if (!categoryname || !categoryslug) {
      req.flash("error", "Please fill in the form correctly!");
      return res.redirect("/admin/category/add");
    }

    const NewCategory = {
      name: req.body.categoryname,
      slug: req.body.categoryslug
    };

    new Category(NewCategory)
      .save()
      .then(() => {
        req.flash("success", `${categoryname} has been added!`);
        res.redirect("/admin/categories");
      })
      .catch(() => {
        req.flash("error", "There was an internal error while saving!");
        res.redirect("/admin/categories");
      });
  }

  async update(req, res) {
    await Category.findByIdAndUpdate(req.params._id, req.body)
      .then(category => {
        req.flash("success", `The category ${category.name} has been updated!`);
        return res.redirect("/admin/categories");
      })
      .catch(err => {
        req.flash("error", `There was an error! Try again later.`);
        return res.redirect("/admin/categories");
      });
  }

  async destroy(req, res) {
    await Category.findByIdAndDelete(req.params._id);
    req.flash("success", "The selected category has been deleted!");
    return res.redirect("/admin/categories");
  }

  async oneCategory(req, res) {
    const currentPage = req.query.p;
    await Category.findOne({ slug: req.params.slug })
      .then(async cat => {
        if (cat) {
          await Post.paginate(
            { category: cat._id },
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
              res.render("app/newspercategory", {
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
                "There was an error while loading the category page! Try again soon, please."
              );
              console.log(err);
              return res.redirect("/categories");
            });
        } else {
          req.flash("error", "Please, choose a valid category!");
          return res.redirect("/categories");
        }
      })
      .catch(() => {
        req.flash(
          "error",
          `There was an error while loading the page! Try again soon, please.`
        );
        return res.redirect("/categories");
      });
  }

  adminIndex(req, res) {
    Category.find()
      .then(cat => {
        res.render("admin/category", { cat });
      })
      .catch(err => {
        res.send(`Erro: ${err}`);
      });
  }

  async editCategory(req, res) {
    const category = await Category.find({ slug: req.params.slug });
    return res.render("admin/edit-category", { category });
  }
}

module.exports = new CategoryController();
