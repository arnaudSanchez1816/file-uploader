const prisma = require("../db/client")
const { FileType } = require("../generated/prisma/client")

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
