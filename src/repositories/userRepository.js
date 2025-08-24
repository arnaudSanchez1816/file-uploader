const prisma = require("../config/prisma").instance

exports.getUserById = async (id, { includeFiles = false } = {}) => {
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

exports.getUserByEmail = async (email, { includeFiles = false } = {}) => {
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

exports.emailIsUsed = async (email) => {
    const user = await prisma.user.findFirst({
        where: {
            email: email,
        },
    })

    return user !== null
}

exports.createNewUser = async ({ email, password }) => {
    const user = await prisma.user.create({
        data: {
            email,
            password,
        },
    })

    return user
}
