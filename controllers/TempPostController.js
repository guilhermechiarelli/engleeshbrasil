const Categoria = require("../models/Category");
const GrammarRule = require("../models/GrammarRule");
const TempPost = require("../models/TempPost");
const Post = require("../models/Post");

class TempPostController {
  async index(req, res) {
    const currentPage = req.query.p;
    await TempPost.paginate(
      { author: req.session.user._id },
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
        return res.render("author/dashboard", {
          posts,
          pagination: {
            page: page,
            limit: limit,
            pageCount: pageCount
          }
        });
      })
      .catch(err => {
        return res.redirect("/author/dashboard");
      });
  }

  async create(req, res) {
    const cat = await Categoria.find();
    const grammar = await GrammarRule.find();
    return res.render("author/post", { cat, grammar });
  }

  async store(req, res) {
    const {
      postsubject,
      postcategory,
      postcontent,
      grammarrule,
      postgrammar,
      postvocab
    } = req.body;

    if (
      !postsubject ||
      !postcategory ||
      !postcontent ||
      !grammarrule ||
      !postgrammar ||
      !postvocab
    ) {
      req.flash("error", "Please fill in the form correctly!");
      return res.redirect("/author/post");
    }

    const check_subject = await Post.findOne({ subject: postsubject });
    const check_temp_subject = await TempPost.findOne({ subject: postsubject });

    if (check_subject || check_temp_subject) {
      req.flash("error", "This subject already exists!");
      return res.redirect("/author/post");
    }

    const postslug = Link(postsubject);
    const summary = trimByWord(postcontent);

    const post = await TempPost.create({
      subject: req.body.postsubject,
      slug: postslug,
      category: req.body.postcategory,
      content: req.body.postcontent,
      summary: summary,
      grammarrule: req.body.grammarrule,
      grammartip: req.body.postgrammar,
      vocabtip: req.body.postvocab,
      author: req.session.user._id
    });

    new TempPost(post)
      .save()
      .then(() => {
        req.flash("success", "Congrats! Now wait for approval!");
        if (req.session.admin) {
          return res.redirect("/admin/pendding/posts");
        }
        return res.redirect("/author/dashboard");
      })
      .catch(err => {
        req.flash("error", `There was an error: ${err}`);
        if (req.session.admin) {
          return res.redirect("/admin/pendding/posts");
        }
        return res.redirect("/author/dashboard");
      });
  }

  async editPost(req, res) {
    const post = await TempPost.find({ slug: req.params.slug })
      .populate("category")
      .populate("grammarrule");
    const cat = await Categoria.find({ _id: { $ne: post[0].category._id } });
    const grammar = await GrammarRule.find({
      _id: { $ne: post[0].grammarrule._id }
    });

    return res.render("author/author-edit-post", { post, cat, grammar });
  }

  async update(req, res) {
    const {
      subject,
      content,
      grammartip,
      vocabtip,
      category,
      grammarrule
    } = req.body;

    if (
      !subject ||
      !content ||
      !grammartip ||
      !vocabtip ||
      !category ||
      !grammarrule
    ) {
      req.flash(
        "error",
        "Looks like you've forgotten to fill in some field! Please try again."
      );
      return res.redirect("/author/dashboard");
    }

    const slug = Link(subject);
    const summary = trimByWord(content);

    await TempPost.findByIdAndUpdate(
      req.params._id,
      {
        subject: req.body.subject,
        slug: slug,
        category: req.body.category,
        content: req.body.content,
        summary: summary,
        grammarrule: req.body.grammarrule,
        grammartip: req.body.grammartip,
        vocabtip: req.body.vocabtip
      },
      {
        new: true
      }
    )
      .then(() => {
        req.flash("success", "The post information was changed!");
        return res.redirect("/author/dashboard");
      })
      .catch(err => {
        req.flash("error", err);
        return res.redirect("/author/dashboard");
      });
  }

  async destroy(req, res) {
    await TempPost.findByIdAndDelete(req.params._id)
      .then(() => {
        req.flash("success", "The selected post has been deleted!");
        if (req.session.admin) {
          return res.redirect("/admin/pendding/posts");
        }
        return res.redirect("/author/dashboard");
      })
      .catch(() => {
        req.flash("error", "There was an error! Please try again later.");
        if (req.session.admin) {
          return res.redirect("/admin/pendding/posts");
        }
        return res.redirect("/author/dashboard");
      });
  }

  async penddingPosts(req, res) {
    const currentPage = req.query.p;
    await TempPost.paginate(
      {},
      {
        page: parseInt(currentPage) || 1,
        limit: 10,
        sort: { created_At: "desc" },
        populate: [
          { path: "category", select: "name slug" },
          { path: "grammarrule", select: "name" },
          { path: "author" }
        ]
      }
    )
      .then(posts => {
        const page = posts.page;
        const pageCount = posts.pages;
        const limit = posts.limit;
        posts = posts.docs;
        return res.render("admin/pendding-posts", {
          posts,
          pagination: {
            page: page,
            limit: limit,
            pageCount: pageCount
          }
        });
      })
      .catch(err => {
        return res.redirect("/admin/pendding/posts");
      });
  }

  async checkPost(req, res) {
    const post = await TempPost.find({ slug: req.params.slug })
      .populate("category")
      .populate("grammarrule")
      .populate("author");
    const cat = await Categoria.find({ _id: { $ne: post[0].category._id } });
    const grammar = await GrammarRule.find({
      _id: { $ne: post[0].grammarrule._id }
    });

    return res.render("admin/check-newpost", { post, cat, grammar });
  }
}

function trimByWord(sentence) {
  var result = sentence;
  var resultArray = result.split(" ");
  if (resultArray.length > 25) {
    resultArray = resultArray.slice(0, 25);
    result = resultArray.join(" ") + "…";
  }
  return result;
}

function Link(subject) {
  var link = subject
    .toLowerCase()
    .replace(/[ÀÁÂÃÄÅ]/g, "A")
    .replace(/[àáâãäå]/g, "a")
    .replace(/[ÈÉÊË]/g, "E")
    .replace(/[èéêë]/g, "e")
    .replace(/[ÌÍÎÏ]/g, "I")
    .replace(/[ìíîï]/g, "i")
    .replace(/[ÒÓÔÖÕ]/g, "O")
    .replace(/[òóôöõ]/g, "o")
    .replace(/[ÙÚÛÜ]/g, "U")
    .replace(/[ùúûü]/g, "u")
    .replace(/[ç]/g, "c")
    .replace(/[ñ]/g, "n")
    .replace(/[']/g, "-")
    .replace(/[~`´¨ªº°§¬¢£³²¹–!‘’@#$%^&*(){}\[\];:"'<,.>?\/\\|_+=]/g, "")
    .replace(/\s/g, "-")
    .replace(" ", "-")
    .replace("---", "-");

  return link;
}

module.exports = new TempPostController();
