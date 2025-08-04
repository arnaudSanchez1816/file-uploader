const express = require("express")
const userController = require("../controllers/userController")

const router = express.Router()

// Sign Up
router.get("/signup", userController.getSignUp)
router.post("/signup", userController.postSignUp)

// Sign in
router.get("/signin", userController.getSignIn)
router.post("/signin", userController.postSignIn)

// Sign out
router.get("/signout", userController.getSignOut)

module.exports = router
