const { FileType } = require("../config/prisma")
const homeRepository = require("../repositories/homeRepository")
const { stringifyBigInt } = require("../utils/jsonUtils")

exports.getHomeData = async ({ userId }) => {
    const userFiles = await homeRepository.getHomeFiles(userId)
    const breadcrumbs = getHomeBreadcrumbs()
    // all sidebar folders tree
    const sidebarTree = await this.getSidebarFoldersTree(userId)

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
        sidebarTree,
    }
}

function getHomeBreadcrumbs() {
    const breadCrumbs = []
    breadCrumbs.unshift({
        name: "Home",
        link: "/home",
        current: true,
        id: -1,
    })

    return breadCrumbs
}

exports.getSidebarFoldersTree = (userId, rootId = null) => {
    return homeRepository.getSidebarFoldersTree(userId, rootId)
}
