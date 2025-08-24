const fileRepository = require("../repositories/fileRepository")
const folderService = require("../services/folderService")
const sanitizeFilename = require("sanitize-filename")
const storage = require("./storage/storageService")

exports.uploadFile = async ({ userId, file, parentId = null }) => {
    if (!file) {
        throw new Error("No file provided for upload.")
    }

    const fileName = sanitizeFilename(file.originalname)
    const createdFile = await fileRepository.createFile({
        name: fileName,
        ownerId: userId,
        parentId,
        size: file.size,
    })
    try {
        await storage.writeFile(createdFile.path, file.buffer, file.mimetype)
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
    await storage.deleteFile(deletedFile.path)
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

exports.moveIntoFolder = async (fileId, newParentId) => {
    return folderService.moveIntoFolder(fileId, newParentId)
}
