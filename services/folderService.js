const folderRepository = require("../repositories/folderRepository")
const fs = require("fs/promises")
const { FileType } = require("../generated/prisma/client")
const { computeFilePath } = require("../utils/filesUtils")

exports.createFolder = async (userId, folderName, parentId = null) => {
    const createdFolder = await folderRepository.createFolder(
        userId,
        folderName,
        parentId
    )

    return createdFolder
}

exports.getFolderById = async (folderId, { includeChildren = false } = {}) => {
    return folderRepository.getFolderById(folderId, { includeChildren })
}

exports.deleteFolder = async (folderId) => {
    // Get all subfiles of the folder to delete so that we can delete them from storage
    const deletedFolderTree = await folderRepository.getFolderTree(folderId)
    const deletedFolder = await folderRepository.deleteFolder(folderId)

    deleteFolderTree(deletedFolderTree)

    return deletedFolder
}

function deleteFolderTree(folderTree) {
    if (!folderTree) {
        return
    }

    const { type, id, childFiles } = folderTree
    if (type === FileType.FILE) {
        fs.unlink(computeFilePath(id))
    }

    if (childFiles) {
        childFiles.forEach((child) => deleteFolderTree(child))
    }
}
