const { PrismaClient } = require("../generated/prisma/client")
// Extends prisma client to add a path field
const client = new PrismaClient()

module.exports = client
