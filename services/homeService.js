const prisma = require("../db/client")

exports.getHomeData = async ({ userId }) => {
    const userFiles = await prisma.file.findMany({
        where: {
            ownerId: userId,
            parentId: null,
        },
        orderBy: {
            name: "asc",
        },
    })

    return userFiles
}
