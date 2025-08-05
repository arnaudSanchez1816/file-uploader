exports.isAuthenticated =
    ({ redirect = "/signin" } = {}) =>
    (req, res, next) => {
        if (!req.isAuthenticated()) {
            return res.redirect(redirect)
        }

        next()
    }
