const folderRepository = require("../repositories/folderRepository")

exports.createFolder = async (userId, folderName, parentId = null) => {
    return folderRepository.createFolder(userId, folderName, parentId)
}

exports.getFolderById = async (folderId, { includeChildren = false } = {}) => {
    return folderRepository.getFolderById(folderId, { includeChildren })
}
