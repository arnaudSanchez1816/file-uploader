require("dotenv").config()
const express = require("express")
const path = require("path")
const logger = require("morgan")
const cookieParser = require("cookie-parser")
const createHttpError = require("http-errors")
const debug = require("debug")("file-uploader:server")
const http = require("http")

const app = express()

// view engine setup
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

app.use(logger("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")))

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
