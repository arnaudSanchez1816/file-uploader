const express = require("express")

const router = express.Router()

router.get("/", (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect("/home")
    }
    res.render("index")
})

module.exports = router
