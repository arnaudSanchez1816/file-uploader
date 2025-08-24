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
const { FileType } = require("../config/prisma")
const { getFolderTree } = require("../config/prisma")

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
                orderBy: [
                    {
                        type: "asc",
                    },
                    {
                        name: "asc",
                    },
                ],
            },
        },
    })
    return folder
}

exports.getFolderTree = async (folderId) => {
    const folderArray = await prisma.$queryRaw(getFolderTree(folderId))
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

exports.moveIntoFolder = async (folderId, newParentId) => {
    const folder = await prisma.file.update({
        where: {
            id: folderId,
        },
        data: {
            parentId: newParentId,
        },
    })

    return folder
}

exports.shareFolder = async (folderId, expirationDate) => {
    const sharedFolder = await prisma.sharedFile.create({
        data: {
            fileId: folderId,
            expiresAt: expirationDate,
        },
    })

    return sharedFolder
}

/**
 * Parse to a tree graph a list of folders
 * @param list
 * @returns the root node of the tree graph
 */
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
