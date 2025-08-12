const userService = require("../services/userService")
const { body, validationResult, matchedData } = require("express-validator")
const createHttpError = require("http-errors")
const hashPasswordSanitizer = require("../utils/hashPasswordSanitizer")
const debug = require("debug")("file-uploader:users")
const passport = require("../middlewares/passport")

exports.getSignUp = (req, res, next) => {
    res.render("signUp", {
        email: req.query.email,
    })
}

exports.postSignUp = [
    (req, res, next) => {
        if (req.isAuthenticated()) {
            return res.redirect("/")
        }
        next()
    },
    body(["email", "password", "confirmPassword"])
        .exists()
        .bail({ level: "request" })
        .withMessage("Required")
        .isString()
        .notEmpty()
        .withMessage("Required"),
    body("email")
        .isEmail()
        .bail({ level: "chain" })
        .withMessage("E-mail address is not valid")
        .custom(async (value) => {
            // Check email is not already used
            const emailIsUsed = await userService.emailIsUsed({
                userEmail: value,
            })
            if (emailIsUsed) {
                throw new Error("E-mail is already used")
            }
        }),
    body("password")
        .isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 0,
        })
        .withMessage(
            "Must be at least 8 characters long, including:<br>At least one number<br>At least one lowercase letter<br>At least one uppercase letter"
        ),
    body("confirmPassword")
        .custom((value, { req }) => {
            return value === req.body.password
        })
        .withMessage("Passwords do not match"),
    body("password").customSanitizer(hashPasswordSanitizer),
    async function (req, res, next) {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).render("signUp", {
                email: req.body.email,
                errors: errors.mapped(),
            })
        }
        const { email, password } = matchedData(req)

        try {
            const newUser = await userService.createNewUser({ email, password })
            debug(`New user created.\n${newUser.toString()}`)

            req.login(newUser, function (err) {
                if (err) {
                    return next(err)
                }
                return res.redirect("/")
            })
        } catch (error) {
            throw createHttpError(500, error.message)
        }
    },
]

// Sign In
exports.postSignIn = [
    (req, res, next) => {
        if (req.isAuthenticated()) {
            return res.redirect("/home")
        }
        next()
    },
    body(["email", "password"])
        .exists()
        .withMessage("Must not be empty")
        .isString()
        .notEmpty()
        .withMessage("Must not be empty"),
    body("email").isEmail().withMessage("E-mail is invalid"),
    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            const errorsMapped = errors.mapped()
            return res.status(400).render("index", {
                errors: errorsMapped,
                email: req.body.email,
            })
        }
        next()
    },
    passport.authenticate("local", {
        successRedirect: "/home",
        failWithError: true,
        failureFlash: true,
    }),
    (error, req, res, next) => {
        return res.status(401).render("index", {
            errors: {
                auth: {
                    msg: req.flash("error"),
                    path: "auth",
                },
            },
            email: req.body.email,
        })
    },
]

// Sign out
exports.getSignOut = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err)
        }

        res.redirect("/")
    })
}
