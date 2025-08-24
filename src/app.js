require("dotenv").config()
const express = require("express")
const methodOverride = require("method-override")
const path = require("path")
const logger = require("morgan")
const cookieParser = require("cookie-parser")
const createHttpError = require("http-errors")
const debug = require("debug")("file-uploader:server")
const flash = require("connect-flash")
const helmet = require("helmet")
const session = require("./config/session")
const passport = require("./config/passport")
const { isAuthenticated } = require("./middlewares/isAuthenticated")
const { filesize } = require("filesize")
const { FileType } = require("../generated/prisma")

const app = express()

// Security
app.disable("x-powered-by")
app.use(helmet())
// View engine
app.set("views", path.join(__dirname, "./views"))
app.set("view engine", "ejs")
// Logger
if (app.get("env") === "production") {
    app.use(logger("combined"))
} else {
    app.use(logger("dev"))
}
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(flash())
// Static serving
app.use(express.static(path.join(__dirname, "../public")))
// Replace request http method to the method given in _method query parameter.
app.use(methodOverride("_method"))
// Session
app.use(session())
// Passport
app.use(passport.initialize())
app.use(passport.session())

// Add user to locals
app.use((req, res, next) => {
    res.locals.user = req.user
    next()
})

// global locals additions
app.locals.filesize = filesize
app.locals.FileType = FileType

// Fill errors locals with flash errors
app.use((req, res, next) => {
    // Add passport flash errors to locals
    res.locals.errors = req.flash("error")
    next()
})

// Routers
app.use("/home", isAuthenticated(), require("./routes/home"))
app.use("/files", isAuthenticated(), require("./routes/files"))
app.use("/folders", isAuthenticated(), require("./routes/folders"))
app.use("/shared", require("./routes/shared"))
app.use("/", require("./routes/user"))
app.use("/", require("./routes/index"))

// 404 error
// eslint-disable-next-line -- suppress errors for required middleware func parameters
app.use((req, res, next) => {
    throw new createHttpError.NotFound()
})

// Error handler
// eslint-disable-next-line -- suppress errors for required middleware func parameters
app.use((err, req, res, next) => {
    res.locals.message = err.message
    res.locals.status = err.status || 500
    res.locals.error = req.app.get("env") === "development" ? err : {}

    res.status(res.locals.status)
    res.render("error")
    debug("%O", err)
})

module.exports = app
