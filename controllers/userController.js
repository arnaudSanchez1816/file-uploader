const userService = require("../services/userService")
const { body, validationResult, matchedData } = require("express-validator")
const createHttpError = require("http-errors")
const hashPasswordSanitizer = require("../utils/hashPasswordSanitizer")
const debug = require("debug")("file-uploader:users")
const passport = require("../middlewares/passport")
const {
    parseRedirection,
    tryRedirection,
    BODY_SIGN_IN_REDIRECT_TO,
} = require("../middlewares/redirection")

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
        .withMessage("Field is missing.")
        .isString()
        .notEmpty()
        .withMessage("Field must not be empty."),
    body("email")
        .isEmail()
        .withMessage("Invalid e-mail.")
        .custom(async (value) => {
            // Check email is not already used
            try {
                const emailIsUsed = await userService.emailIsUsed({ value })
                if (emailIsUsed) {
                    throw new Error("E-mail already in use.")
                }
            } catch (error) {
                throw createHttpError(500, error.message)
            }
        })
        .withMessage("E-mail provided is already in use."),
    body("password")
        .isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 0,
        })
        .withMessage(
            "Invalid password. A valid password must be at least 8 characters long and contain at least 1 lower case character, 1 upper case character and 1 number."
        ),
    body("confirmPassword")
        .custom((value, { req }) => {
            return value === req.body.password
        })
        .withMessage(
            "The password and password confirmation fields must be identical."
        ),
    body("password").customSanitizer(hashPasswordSanitizer),
    async function (req, res, next) {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            req.flash(
                "error",
                errors.array().map((err) => err.msg)
            )
            return res.redirect(
                `/signup?${new URLSearchParams({ email: req.body.email })}`
            )
        }
        const { email, password } = matchedData(req)

        try {
            const newUser = await userService.createNewUser({ email, password })
            debug(`New user created.\n${newUser}`)

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
exports.getSignIn = [
    (req, res, next) => {
        res.render("signIn", {
            title: "Sign in",
            email: req.query.email,
            redirectTo: req.query[BODY_SIGN_IN_REDIRECT_TO],
        })
    },
]

exports.postSignIn = [
    (req, res, next) => {
        if (req.isAuthenticated()) {
            return res.redirect("/")
        }
        next()
    },
    body(["email", "password"])
        .exists()
        .withMessage("Field is missing.")
        .isString()
        .notEmpty()
        .withMessage("Field must not be empty."),
    body("email").isEmail(),
    parseRedirection(),
    (req, res, next) => {
        const errors = validationResult(req).array()

        if (errors.length > 0) {
            // Redirect validation errors
            req.flash(
                "error",
                errors
                    .filter((err) => err.path !== BODY_SIGN_IN_REDIRECT_TO)
                    .map((err) => err.msg)
            )
            const queryParams = new URLSearchParams()
            queryParams.append("email", req.body.email)
            if (req.body[BODY_SIGN_IN_REDIRECT_TO]) {
                queryParams.append(
                    BODY_SIGN_IN_REDIRECT_TO,
                    req.body[BODY_SIGN_IN_REDIRECT_TO]
                )
            }
            return res.redirect(`/sign-in?${queryParams.toString()}`)
        }
        next()
    },
    passport.authenticate("local", {
        failWithError: true,
        failureFlash: true,
    }),
    tryRedirection,
    (req, res, next) => {
        res.redirect("/")
    },
    (error, req, res, next) => {
        // Redirect authenticate error
        const queryParams = new URLSearchParams()
        queryParams.append("email", req.body.email)
        return res.redirect(`/signin?${queryParams.toString()}`)
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
