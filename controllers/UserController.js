const User = require("../models/User");
const Token = require("../models/Token");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const validator = require("email-validator");

class UserController {
  create(req, res) {
    res.render("signup");
  }

  index(req, res) {
    return res.render("app/profile");
  }

  async store(req, res) {
    const { name, surname, email, password } = req.body;

    if (!name || !surname || !email || !password) {
      req.flash("error", "Parece que você esqueceu de preencher algum campo!");
      return res.redirect("/signup");
    }

    if (!validator.validate(email)) {
      req.flash("error", "E-mail inválido!");
      return res.redirect("/signup");
    }

    const check_user = await User.findOne({ email: email });

    if (check_user) {
      req.flash("error", "This user already exists!");
      return res.redirect("/signup");
    }

    await User.create(req.body)
      .then(user => {
        const token = new Token({
          type: "create-user",
          userId: user._id,
          token: crypto.randomBytes(16).toString("hex")
        });
        token.save(async err => {
          if (err) {
            await User.findByIdAndDelete(user._id);
            req.flash(
              "error",
              `Houve um erro interno! Por gentileza, tente novamente mais tarde!`
            );
            return res.redirect("/signin");
          }

          // Send the email
          var transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL,
              pass: process.env.EMAIL_PASS
            }
          });
          var mailOptions = {
            from: process.env.EMAIL,
            to: user.email,
            subject: "Engleesh - Email Verification",
            text:
              `Hello, ${user.name}! \n\n` +
              "Please verify your account by clicking the link: \nhttp://" +
              req.headers.host +
              "/confirmation/" +
              token.token +
              ".\n" +
              "You are now part of the Engleesh learners community! \n\n" +
              "Please remember that this link will only be available for one hour. Otherwise, you will need to generate another one by logging on the website.\n" +
              "Thank you!"
          };
          transporter.sendMail(mailOptions, async function(err) {
            if (err) {
              await User.findByIdAndDelete(user._id);
              req.flash(
                "error",
                `Houve um erro ao enviar o e-mail. Por gentileza, tente novamente mais tarde!`
              );
              return res.redirect("/signup");
            }
            req.flash(
              "success",
              `Um e-mail de verificação foi enviado para você. Basta confirmar e fazer seu login!`
            );
            return res.redirect("/signin");
          });
        });
      })
      .catch(err => {
        req.flash(
          "error",
          `Houve um erro ao criar o usuário. Por gentileza, tente novamente mais tarde!`
        );
        return res.redirect("/signup");
      });
  }

  async confirmation(req, res) {
    const { token } = req.params;
    await Token.findOne({ token: token })
      .then(async token => {
        await User.findOne({ _id: token.userId })
          .then(async user => {
            if (user.confirmed) {
              return res.send("This user has already been confirmed!");
            }
            user.confirmed = true;
            await user.save(async err => {
              if (err) {
                return res.send(
                  "Houve um erro ao liberar o acesso ao seu usuário. Por gentileza, nos contate para a correção do problema."
                );
              }
              await Token.findByIdAndDelete(token._id);
              return res.render("signin-confirmation");
            });
          })
          .catch(err => {
            return res.send(
              "Usuário não encontrado! Por gentileza, nos contate para a correção do problema com o seu usuário."
            );
          });
      })
      .catch(err => {
        return res.render("error");
      });
  }

  async update(req, res) {
    const { senha, name, surname } = req.body;

    if (!senha || !name || !surname) {
      req.flash(
        "error",
        "Looks like you've forgotten to fill in some field! Please try again."
      );
      return res.redirect("/app/profile");
    }

    const user = await User.findById(req.params._id);
    if (!(await user.compareHash(senha))) {
      req.flash(
        "error",
        "Wrong password! Please type again the information and the right password."
      );
      return res.redirect("/app/profile");
    }
    if (user.updated >= 5) {
      req.flash(
        "error",
        "You've already changed your information too many times!"
      );
      return res.redirect("/app/profile");
    }

    await User.findByIdAndUpdate(
      req.params._id,
      { $inc: { updated: 1 }, name: name, surname: surname },
      {
        new: true
      }
    )
      .then(user => {
        req.session.user = user;
        req.flash(
          "success",
          `Your information was changed to ${user.name} ${user.surname}!`
        );
        return res.redirect("/app/profile");
      })
      .catch(() => {
        req.flash("error", "There was an error. Try again later!");
        return res.redirect("/app/profile");
      });
  }

  forgotPassword(req, res) {
    return res.render("forgot-password");
  }

  async forgotPasswordEmail(req, res) {
    const { email, name } = req.body;

    if (!email || !name) {
      req.flash(
        "error",
        "Looks like you've forgotten to fill in some field! Please try again."
      );
      return res.redirect("/forgot");
    }

    const user = await User.findOne({ email: email, name: name });

    if (!user) {
      req.flash(
        "error",
        "User not found! Type your email and your first name. Do not forget the accentuation, if any."
      );
      return res.redirect("/forgot");
    }

    if (!user.confirmed) {
      req.flash(
        "error",
        "Usuário pendente de confirmação! Confirme antes de mudar a senha."
      );
      return res.redirect("/forgot");
    }

    const token_user = await Token.findOne({ userId: user._id });

    if (token_user) {
      req.flash(
        "error",
        "There is already a password change request for this user. If you didn't receive the email, for your security, you can request the password change again within one hour."
      );
      return res.redirect("/forgot");
    }

    if (user) {
      const token = new Token({
        type: "reset-password",
        userId: user._id,
        token: crypto.randomBytes(16).toString("hex")
      });
      token.save(err => {
        if (err) {
          req.flash("error", `There was an error! Please try again later!`);
          return res.redirect("/forgot");
        }

        // Send the email
        var transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS
          }
        });
        var mailOptions = {
          from: process.env.EMAIL,
          to: user.email,
          subject: "Engleesh - Reset Password",
          text:
            `Hello, ${user.name}! \n\n` +
            "Please change your password by clicking the link: \nhttp://" +
            req.headers.host +
            "/forgot/" +
            token.token +
            ".\n\n" +
            "Please remember that this link will only be available for one hour. Otherwise, you will need to generate another one on the website.\n" +
            "Thank you!"
        };
        transporter.sendMail(mailOptions, async function(err) {
          if (err) {
            await Token.findByIdAndDelete(token._id);
            req.flash(
              "error",
              `There was an error while sending the email! Please try again later.`
            );
            return res.redirect("/forgot");
          }
          req.flash(
            "success",
            `An email was sent to you with the password change instructions!`
          );
          return res.redirect("/signin");
        });
      });
    }
  }

  async resetPassword(req, res) {
    const { token } = req.params;

    const token_ok = await Token.find({ token: token });

    if (!token_ok || token_ok == "" || token_ok == undefined) {
      return res.render("error");
    }

    const user = await User.find({ _id: token_ok.userId });

    if (!user) {
      await Token.findByIdAndDelete(token_ok._id);
      return res.send(
        "No users associated with the request were found! For security reasons, the password change request has been canceled! Please try again on the website."
      );
    }

    return res.render("reset-password", { token_ok });
  }

  async resetPasswordUpdate(req, res) {
    const { user_id, password, password2 } = req.body;
    const { token } = req.params;

    if (!user_id || !password || !password2) {
      req.flash(
        "error",
        "Looks like you've forgotten to fill in some field! Please try again."
      );
      return res.redirect(`/forgot/${token}`);
    }

    const token_ok = await Token.findOne({ token: token });

    if (!token_ok || token_ok == "" || token_ok == undefined) {
      return res.render("error");
    }

    if (password != password2) {
      req.flash("error", "The passwords are different! Please try again.");
      return res.redirect(`/forgot/${token}`);
    }

    await User.findOne({ _id: user_id })
      .then(async user => {
        if (!user) {
          await Token.findByIdAndDelete(token_ok._id);
          req.flash(
            "error",
            "No users associated with the request were found! For security reasons, the password change request has been canceled! Please try again on the website."
          );
          return res.redirect("/forgot");
        }
        user.password = password;
        await user.save();

        await Token.findByIdAndDelete(token_ok._id);
        req.flash("success", "Your password has been changed!");
        return res.redirect("/signin");
      })
      .catch(async () => {
        await Token.findByIdAndDelete(token_ok._id);
        req.flash(
          "error",
          "No users associated with the request were found! For security reasons, the password change request has been canceled! Please try again!"
        );
        return res.redirect("/forgot");
      });
  }

  resend(req, res) {
    if (!req.session.resend) {
      return res.render("error");
    }
    req.session.resend = false;
    return res.render("resend-confirmation");
  }

  async resendEmail(req, res) {
    const { email, name } = req.body;

    if (!email || !name) {
      req.session.resend = true;
      req.flash("error", "Parece que você esqueceu de preencher algum campo!");
      return res.redirect("/resend");
    }

    const user = await User.findOne({ email: email, name: name });

    if (!user) {
      req.session.resend = true;
      req.flash(
        "error",
        "Informações incorretas! Digite o e-mail e seu primeiro nome inseridos no ato do cadastro."
      );
      return res.redirect("/resend");
    }

    if (user.confirmed) {
      req.flash(
        "success",
        "Este usuário já está confirmado! Faça o login e seja feliz. =)"
      );
      return res.redirect("/signin");
    }

    const token_user = await Token.findOne({ userId: user._id });

    if (!token_user) {
      const token = new Token({
        type: "resend-create-user",
        userId: user._id,
        token: crypto.randomBytes(16).toString("hex")
      });
      token.save(err => {
        if (err) {
          req.flash(
            "error",
            `Houve um erro interno! Por gentileza, tente novamente mais tarde.`
          );
          return res.redirect("/signin");
        }
        // Send the email
        var transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS
          }
        });

        var mailOptions = {
          from: process.env.EMAIL,
          to: user.email,
          subject: "Engleesh - Email Verification (Resend)",
          text:
            `Hello, ${user.name}! \n\n` +
            "Please verify your account by clicking the link: \nhttp://" +
            req.headers.host +
            "/confirmation/" +
            token.token +
            ".\n\n" +
            "You are now part of the Engleesh learners community! \n" +
            "Please remember that this link will only be available for one hour. Otherwise, you will need to generate another one by logging on the website. \n" +
            "Thank you!"
        };

        transporter.sendMail(mailOptions, async function(err) {
          if (err) {
            await Token.findByIdAndDelete(token._id);
            req.flash(
              "error",
              `Houve um erro ao enviar o e-mail. Por gentileza, tente novamente mais tarde!`
            );
            return res.redirect("/signin");
          }
        });
      });
      req.flash(
        "success",
        `Um e-mail de verificação foi reenviado para você. Basta confirmar, fazer seu login e ser feliz! =)`
      );
      return res.redirect("/signin");
    }

    if (token_user && token_user.type !== "resend-create-user") {
      token_user.type = "resend-create-user";
      await token_user.save();
      // Send the email
      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASS
        }
      });

      var mailOptions = {
        from: process.env.EMAIL,
        to: user.email,
        subject: "Engleesh - Email Verification (Resend)",
        text:
          `Hello, ${user.name}! \n\n` +
          "Please verify your account by clicking the link: \nhttp://" +
          req.headers.host +
          "/confirmation/" +
          token_user.token +
          ".\n" +
          "You are now part of the Engleesh learners community! \n\n" +
          "Please remember that this link will only be available for one hour. Otherwise, you will need to generate another one by logging on the website. \n" +
          "Thank you!"
      };

      transporter.sendMail(mailOptions, async function(err) {
        if (err) {
          await Token.findByIdAndDelete(token_user._id);
          req.flash(
            "error",
            `Houve um erro ao enviar o e-mail. Por gentileza, tente novamente mais tarde!`
          );
          return res.redirect("/signin");
        }
      });
      req.flash(
        "success",
        `Um e-mail de verificação foi reenviado para você. Basta confirmar, fazer seu login e ser feliz! =)`
      );
      return res.redirect("/signin");
    }

    req.flash(
      "error",
      "O e-mail de confirmação já foi reenviado. Aguarde alguns minutos e verifique sua caixa de spam, ou, para sua segurança, solicite novamente o reenvio do e-mail dentro de uma hora."
    );
    return res.redirect("/signin");
  }
}

module.exports = new UserController();
