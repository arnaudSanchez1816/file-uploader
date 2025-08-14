const prisma = require("../db/client")
const { FileType } = require("../generated/prisma/client")

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
    const breadcrumbs = getHomeBreadcrumbs()

    return {
        folder: {
            id: null,
            name: "Home",
            parentId: null,
            ownerId: userId,
            type: FileType.FOLDER,
            createdAt: null,
            childFiles: userFiles,
        },
        breadcrumbs,
    }
}

exports.getHomeBreadcrumbs = () => {
    const breadCrumbs = []
    breadCrumbs.unshift({
        name: "Home",
        link: "/",
        current: true,
    })

    return breadCrumbs
}

function getHomeBreadcrumbs() {
    const breadCrumbs = []
    breadCrumbs.unshift({
        name: "Home",
        link: "/home",
        current: true,
    })

    return breadCrumbs
}
