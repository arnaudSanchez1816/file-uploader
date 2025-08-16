const prisma = require("../db/client")
const { FileType } = require("../generated/prisma/client")
const { stringifyBigInt } = require("../utils/jsonUtils")

exports.getHomeData = async ({ userId }) => {
    const userFiles = await prisma.file.findMany({
        where: {
            ownerId: userId,
            parentId: null,
        },
        orderBy: [
            {
                type: "desc",
            },
            {
                name: "asc",
            },
        ],
    })
    const breadcrumbs = getHomeBreadcrumbs()

    const filesJson = stringifyBigInt(
        userFiles
            .filter((f) => f.type === FileType.FILE)
            .map((file) => {
                return { ...file, createdAt: file.createdAt.toDateString() }
            })
    )

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
        filesJson,
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
