const Categoria = require("../models/Category");
const Post = require("../models/Post");
const GrammarRule = require("../models/GrammarRule");
const TempPost = require("../models/TempPost");

class PostController {
  async store(req, res) {
    const {
      subject,
      content,
      category,
      grammarrule,
      grammartip,
      vocabtip,
      author,
      created_At
    } = req.body;

    if (
      !subject ||
      !category ||
      !content ||
      !grammarrule ||
      !grammartip ||
      !vocabtip ||
      !author ||
      !created_At
    ) {
      req.flash("error", "Please fill in the form correctly!");
      return res.redirect("/admin/pendding/posts");
    }

    const postslug = Link(subject);
    const summary = trimByWord(content);

    const post = await Post.create({
      subject: req.body.subject,
      slug: postslug,
      category: req.body.category,
      content: req.body.content,
      summary: summary,
      grammarrule: req.body.grammarrule,
      grammartip: req.body.grammartip,
      vocabtip: req.body.vocabtip,
      author: author,
      approved_By: req.session.user._id,
      created_At: req.body.created_At
    });

    new Post(post)
      .save()
      .then(async () => {
        await TempPost.findByIdAndDelete(req.params._id);
        req.flash("success", "The new article has been approved!");
        return res.redirect("/admin/news");
      })
      .catch(err => {
        res.send(`There was an error: ${err}`);
      });
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
      return res.redirect("/admin/news");
    }

    const slug = Link(subject);
    const summary = trimByWord(content);

    await Post.findByIdAndUpdate(
      req.params._id,
      {
        subject: req.body.subject,
        slug: slug,
        category: req.body.category,
        content: req.body.content,
        summary: summary,
        grammarrule: req.body.grammarrule,
        grammartip: req.body.grammartip,
        vocabtip: req.body.vocabtip,
        approved_By: req.session.user._id,
        approved_At: Date.now()
      },
      {
        new: true
      }
    )
      .then(() => {
        req.flash("success", "The post information was changed!");
        return res.redirect("/admin/dashboard");
      })
      .catch(err => {
        req.flash("error", err);
        return res.redirect("/admin/dashboard");
      });
  }

  async destroy(req, res) {
    await Post.findByIdAndDelete(req.params._id);
    req.flash("success", "The selected post has been deleted!");
    return res.redirect("/admin/news");
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

module.exports = new PostController();
