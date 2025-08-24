const session = require("express-session")
const { PrismaSessionStore } = require("@quixo3/prisma-session-store")
const prismaClient = require("./prisma").instance

function configureSession() {
    return session({
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
}

module.exports = configureSession
