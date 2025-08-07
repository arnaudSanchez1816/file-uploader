const fileRepository = require("../repositories/fileRepository")
const fs = require("fs/promises")
const sanitizeFilename = require("sanitize-filename")

exports.uploadFile = async ({ userId, file, parentId = null }) => {
    if (!file) {
        throw new Error("No file provided for upload.")
    }

    const fileName = sanitizeFilename(file.originalname)
    const createdFile = await fileRepository.createFile({
        name: fileName,
        ownerId: userId,
        parentId,
    })
    try {
        await fs.writeFile(createdFile.path, file.buffer)
        return createdFile
    } catch (error) {
        await fileRepository.deleteFile({
            fileId: createdFile.id,
        })
        throw error
    }
}

exports.deleteFile = async (userId, fileId) => {
    if (!fileId) {
        throw new Error("No file id provided.")
    }

    const deletedFile = await fileRepository.deleteFile({ fileId })
    await fs.unlink(deletedFile.path)
}

exports.getFileById = async (fileId, ownerId = null) => {
    return fileRepository.getFileById({ fileId, ownerId })
}

exports.isFileOwner = async (fileId, userId) => {
    try {
        const file = await fileRepository.getFileById({
            fileId: fileId,
            ownerId: userId,
        })
        return file !== null
    } catch {
        return false
    }
}
