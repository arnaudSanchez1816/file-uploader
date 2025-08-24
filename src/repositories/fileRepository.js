const { FileType } = require("../config/prisma")
const { computeFilePath } = require("../utils/filesUtils")
const prisma = require("../config/prisma").instance.$extends({
    result: {
        file: {
            path: {
                compute(file) {
                    return computeFilePath(file.id)
                },
            },
            link: {
                compute(file) {
                    return `/files/${file.id}`
                },
            },
        },
    },
})

exports.createFile = async ({ name, ownerId, parentId = null, size }) => {
    return prisma.file.create({
        data: {
            name,
            ownerId,
            createdAt: new Date(),
            type: FileType.FILE,
            parentId,
            size: size,
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
