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

exports.getFolderData = async (folderId) => {
    const folder = await folderRepository.getFolderById(folderId, {
        includeChildren: true,
    })
    let breadcrumbs = []
    if (folder) {
        breadcrumbs = await getFolderBreadcrumbs(folderId)
    }

    return {
        folder,
        breadcrumbs,
    }
}

async function getFolderBreadcrumbs(folderId) {
    const breadCrumbs = []

    if (folderId !== null) {
        const folderTree = await folderRepository.getFolderTree(folderId)
        let treeNode = folderTree
        while (treeNode.level <= 0) {
            const { name, id, level } = treeNode
            breadCrumbs.push({
                name: name,
                link: `/folders/${id}`,
                current: level === 0,
            })

            if (!treeNode.childFiles || treeNode.childFiles.length <= 0) {
                break
            }
            treeNode = treeNode.childFiles[0]
        }
    }
    breadCrumbs.unshift({
        name: "Home",
        link: "/",
        current: false,
    })

    return breadCrumbs
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

    const { type, id, childFiles, level } = folderTree
    if (level > 0 && type === FileType.FILE) {
        fs.unlink(computeFilePath(id))
    }

    if (childFiles) {
        childFiles.forEach((child) => deleteFolderTree(child))
    }
}
