const express = require("express")

const router = express.Router()

router.get("/", (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.redirect("/home")
    }
    res.render("index")
})

module.exports = router
