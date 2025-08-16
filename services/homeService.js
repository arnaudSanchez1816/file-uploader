const prisma = require("../db/client")
const { FileType } = require("../generated/prisma/client")
const { getAllFoldersTree } = require("../generated/prisma/sql")
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

exports.getSidebarFoldersTree = async (userId) => {
    const allFolders = await prisma.$queryRaw(getAllFoldersTree(userId))
    return parseToSidebarFoldersTree(allFolders)
}

function parseToSidebarFoldersTree(allFolders) {
    let map = {},
        root = { id: -1, name: "Home", folders: [] }
    map[-1] = root

    for (let i = 0; i < allFolders.length; ++i) {
        const node = allFolders[i]
        map[node.id] = node
        node.folders = []

        const parent = map[node.parentId || -1]
        parent.folders.push(node)
    }
    return root
}
