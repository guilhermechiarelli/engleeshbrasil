const Post = require("../models/Post");
const Categoria = require("../models/Category");
const GrammarRule = require("../models/GrammarRule");

class NewsController {
  async index(req, res) {
    const currentPage = req.query.p;

    await Post.paginate(
      {},
      {
        page: parseInt(currentPage) || 1,
        limit: 10,
        sort: { approved_At: "desc" },
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
        res.render("news", {
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
          "There was an error while loading the page! Please try again soon."
        );
        res.redirect("/news");
      });
  }

  async postPage(req, res) {
    const post = await Post.find({ slug: req.params.slug })
      .populate("category")
      .populate("grammarrule");

    if (!post || post == null || post == undefined || post == "") {
      return res.render("error");
    }

    return res.render("app/newspage", { post });
  }

  async adminIndex(req, res) {
    const currentPage = req.query.p;
    await Post.paginate(
      {},
      {
        page: parseInt(currentPage) || 1,
        limit: 10,
        sort: { approved_At: "desc" },
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
        res.render("admin/posts", {
          posts,
          pagination: {
            page: page,
            limit: limit,
            pageCount: pageCount
          }
        });
      })
      .catch(err => {
        res.redirect("/news");
      });
  }

  async adminPostPage(req, res) {
    const post = await Post.find({ slug: req.params.slug })
      .populate("category")
      .populate("grammarrule");
    const cat = await Categoria.find({ _id: { $ne: post[0].category._id } });
    const grammar = await GrammarRule.find({
      _id: { $ne: post[0].grammarrule._id }
    });

    return res.render("admin/edit-post", { post, cat, grammar });
  }
}

module.exports = new NewsController();
