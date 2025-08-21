const { FileType } = require("../generated/prisma/client")
const prisma = require("../db/client").$extends({
    result: {
        file: {
            link: {
                compute(file) {
                    return file.type === FileType.FILE
                        ? `/files/${file.id}`
                        : `/folders/${file.id}`
                },
            },
        },
    },
})
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

exports.getSidebarFoldersTree = async (userId, rootId = null) => {
    const allFolders = await prisma.$queryRaw(getAllFoldersTree(userId))
    return parseToSidebarFoldersTree(allFolders, rootId)
}

function parseToSidebarFoldersTree(allFolders, rootId = null) {
    let root = { id: -1, name: "Home", folders: [], link: "/home" }
    if (rootId !== null) {
        const rootFolder = allFolders.filter((f) => f.id === rootId)[0]
        if (!rootFolder) {
            throw new Error(`Failed to find root folder with id ${rootId}`)
        }
        root = rootFolder
    }

    let map = {}
    map[root.id] = root

    for (let i = 0; i < allFolders.length; ++i) {
        const node = allFolders[i]
        map[node.id] = node
        node.folders = []
        node.link = `/folders/${node.id}`

        // home "folder" is represented by id -1
        const parentId = node.parentId || -1
        const parent = map[parentId]
        if (parent) {
            parent.folders.push(node)
        }
    }
    return root
}
