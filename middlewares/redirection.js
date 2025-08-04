const { body, validationResult } = require("express-validator")

const BODY_SIGN_IN_REDIRECT_TO = "redirectTo"
exports.BODY_SIGN_IN_REDIRECT_TO = BODY_SIGN_IN_REDIRECT_TO

exports.parseRedirection = () => [
    // Optional query redirect relative url
    body(BODY_SIGN_IN_REDIRECT_TO)
        .optional()
        .matches(/^(?!www\.|(?:http|ftp)s?:\/\/|[A-Za-z]:\\|\/\/).*/gm),
    (req, res, next) => {
        if (!req.body) {
            return next()
        }

        const errors = validationResult(req).mapped()

        if (errors[BODY_SIGN_IN_REDIRECT_TO]) {
            // Ignore invalid redirect to urls
            return next()
        }

        // Assign redirect url
        req.redirectTo = req.body[BODY_SIGN_IN_REDIRECT_TO]
        next()
    },
]

exports.tryRedirection = (req, res, next) => {
    console.log("test ")
    if (req.redirectTo) {
        console.log("test ")

        return res.redirect(req.redirectTo)
    }

    next()
}
