const path = require("path")
const { FileType } = require("../generated/prisma/client")
// Extends prisma client to add a path field
const prisma = require("../db/client").$extends({
    result: {
        file: {
            path: {
                needs: {
                    type: FileType.FILE,
                },
                compute(file) {
                    return path.join(process.env.FILES_DATA_PATH, `${file.id}`)
                },
            },
        },
    },
})

exports.createFile = async ({ name, ownerId, parentId = null }) => {
    return prisma.file.create({
        data: {
            name,
            ownerId,
            createdAt: new Date(),
            type: FileType.FILE,
            parentId,
        },
    })
}

exports.deleteFile = async ({ fileId }) => {
    return prisma.file.delete({
        where: {
            id: fileId,
            type: FileType.FILE,
        },
    })
}

exports.getFileById = async ({ fileId, ownerId = null }) => {
    let getFileInput
    if (ownerId) {
        getFileInput = {
            where: {
                id: fileId,
                ownerId: ownerId,
                type: FileType.FILE,
            },
        }
    } else {
        getFileInput = {
            where: {
                id: fileId,
                type: FileType.FILE,
            },
        }
    }

    return prisma.file.findUnique(getFileInput)
}
