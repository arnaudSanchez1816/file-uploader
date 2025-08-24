const { PrismaClient } = require("../../generated/prisma/client")
const client = require("../../generated/prisma/client")
const sql = require("../../generated/prisma/sql")

const instance = new PrismaClient()

module.exports = {
    ...client,
    ...sql,
    get instance() {
        return instance
    },
}
