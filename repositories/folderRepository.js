const prisma = require("../db/client")
const { FileType } = require("../generated/prisma/client")
const { getFolderTree } = require("../generated/prisma/sql")
const { folderArrayToTree } = require("../utils/prismaUtils")

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

exports.moveFolder = async (folderId, newParentId) => {
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
