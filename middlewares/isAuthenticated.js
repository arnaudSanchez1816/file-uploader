exports.isAuthenticated =
    ({ redirect = "/" } = {}) =>
    (req, res, next) => {
        if (!req.isAuthenticated()) {
            return res.redirect(redirect)
        }

        next()
    }
