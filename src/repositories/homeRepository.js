const { FileType } = require("../config/prisma")
const { getAllFoldersTree } = require("../config/prisma")
const prisma = require("../config/prisma").instance.$extends({
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

exports.getHomeFiles = async (userId) => {
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

    return userFiles
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
