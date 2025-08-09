const prisma = require("../db/client")
const { FileType } = require("../generated/prisma/client")
const { getFilesTree } = require("../generated/prisma/sql")

exports.createFolder = async (userId, folderName, parentId = null) => {
    const folder = await prisma.file.create({
        data: {
            ownerId: userId,
            name: folderName,
            parentId: parentId,
            type: FileType.FOLDER,
        },
    })

    return folder
}

exports.getFolderById = async (folderId, { includeChildren = false } = {}) => {
    const folder = await prisma.file.findUnique({
        where: {
            id: folderId,
            type: FileType.FOLDER,
        },
        include: {
            childFiles: includeChildren && {
                orderBy: {
                    name: "asc",
                },
            },
        },
    })
    return folder
}

function folderArrayToTree(list) {
    let map = {},
        root

    for (let i = 0; i < list.length; ++i) {
        const node = list[i]
        map[node.id] = i
        list[i].childFiles = []
        if (i !== 0) {
            const parentIndex = map[node.parentId]
            list[parentIndex].childFiles.push(node)
            node.parent = list[parentIndex]
        } else {
            root = node
        }
    }
    return root
}

exports.getFolderTree = async (folderId) => {
    const folderArray = await prisma.$queryRaw(getFilesTree(folderId))
    return folderArrayToTree(folderArray)
}

exports.deleteFolder = async (folderId) => {
    const deletedFolder = await prisma.file.delete({
        where: {
            id: folderId,
        },
    })

    return deletedFolder
}
