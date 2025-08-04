const prisma = require("../db/client")

class UserService {
    constructor() {}

    async getUserById({ id }, { includeFiles = false } = {}) {
        const user = await prisma.user.findUnique({
            where: {
                id: id,
            },
            include: {
                files: includeFiles,
            },
        })
        return user
    }

    async getUserByEmail({ email }, { includeFiles = false } = {}) {
        const user = await prisma.user.findUnique({
            where: {
                email: email,
            },
            include: {
                files: includeFiles,
            },
        })
        return user
    }

    async emailIsUsed({ email }) {
        const isUsed =
            (await prisma.user.findFirst({
                where: {
                    email: email,
                },
            })) !== null

        return isUsed
    }

    async createNewUser({ email, password }) {
        const user = await prisma.user.create({
            data: {
                email: email,
                password: password,
            },
        })

        return user
    }
}

module.exports = new UserService()
