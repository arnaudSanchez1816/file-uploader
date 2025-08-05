const prisma = require("../db/client")

exports.getHomeData = async ({ userId }) => {
    const userFiles = await prisma.file.findMany({
        where: {
            ownerId: userId,
        },
        orderBy: {
            name: "asc",
        },
    })

    return userFiles
}
