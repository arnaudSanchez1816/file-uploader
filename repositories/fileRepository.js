const path = require("path")
// Extends prisma client to add a path field
const prisma = require("../db/client").$extends({
    result: {
        file: {
            path: {
                compute(file) {
                    return path.join(process.env.FILES_DATA_PATH, `${file.id}`)
                },
            },
        },
    },
})

exports.createFile = async ({ name, ownerId }) => {
    return prisma.file.create({
        data: {
            name,
            ownerId,
            uploadedAt: new Date(),
        },
    })
}

exports.deleteFile = async ({ fileId }) => {
    return prisma.file.delete({
        where: {
            id: fileId,
        },
    })
}

exports.getFileById = async ({ fileId, ownerId = null }) => {
    let deleteInput
    if (ownerId) {
        deleteInput = {
            where: {
                id: fileId,
                ownerId: ownerId,
            },
        }
    } else {
        deleteInput = {
            where: {
                id: fileId,
            },
        }
    }

    return prisma.file.findUnique(deleteInput)
}
