require("dotenv").config()
const express = require("express")
const methodOverride = require("method-override")
const path = require("path")
const logger = require("morgan")
const cookieParser = require("cookie-parser")
const createHttpError = require("http-errors")
const debug = require("debug")("file-uploader:server")
const flash = require("connect-flash")
const http = require("http")
const session = require("express-session")
const { PrismaSessionStore } = require("@quixo3/prisma-session-store")
const prismaClient = require("./db/client")
const passport = require("./middlewares/passport")
const { isAuthenticated } = require("./middlewares/isAuthenticated")
const fs = require("fs")

if (process.env["FILES_DATA_PATH"] === undefined) {
    throw new Error("Missing FILES_DATA_PATH env variable.")
}

// Create FILES_DATA_PATH folders
if (!fs.existsSync(process.env.FILES_DATA_PATH)) {
    fs.mkdirSync(process.env.FILES_DATA_PATH, { recursive: true })
}

const app = express()

// view engine setup
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

app.use(logger("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(flash())
app.use(express.static(path.join(__dirname, "public")))
// Replace request http method to the method given in _method query parameter.
app.use(methodOverride("_method"))
// Session
app.use(
    session({
        name: "session",
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
        store: new PrismaSessionStore(prismaClient, {
            checkPeriod: 10 * 60 * 1000, // 10 minutes
            dbRecordIdIsSessionId: true,
            dbRecordIdFunction: undefined,
        }),
    })
)
// Passport
app.use(passport.initialize())
app.use(passport.session())

// Add user to locals
app.use((req, res, next) => {
    res.locals.user = req.user
    next()
})

// Fill errors locals with flash errors
app.use((req, res, next) => {
    // Add passport flash errors to locals
    //res.locals.errors = req.flash("error")
    next()
})

// Routers
app.use("/home", isAuthenticated(), require("./routes/home"))
app.use("/files", isAuthenticated(), require("./routes/files"))
app.use("/", require("./routes/user"))
app.use("/", require("./routes/index"))

// 404 error
app.use((req, res, next) => {
    next(createHttpError(404))
})

// Error handler
app.use((err, req, res, next) => {
    res.locals.message = err.message
    res.locals.status = err.status || 500
    res.locals.error = req.app.get("env") === "development" ? err : {}

    res.status(res.locals.status)
    res.render("error")
    debug("%O", err)
})

// Start server

const port = process.env.PORT || "3000"
app.set("port", port)
const server = http.createServer(app)

server.listen(port)
server.on("error", onError)
server.on("listening", onListening)

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== "listen") {
        throw error
    }

    var bind = typeof port === "string" ? "Pipe " + port : "Port " + port

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
            console.error(bind + " requires elevated privileges")
            process.exit(1)
            break
        case "EADDRINUSE":
            console.error(bind + " is already in use")
            process.exit(1)
            break
        default:
            throw error
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address()
    var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port
    debug("Listening on " + bind)
}
