const folderRepository = require("../repositories/folderRepository")
const storageService = require("./storage/storageService")
const { FileType } = require("../generated/prisma/client")
const { stringifyBigInt } = require("../utils/jsonUtils")
const { getSidebarFoldersTree } = require("./homeService")
const createHttpError = require("http-errors")
const { computeFilePath } = require("../utils/filesUtils")

exports.createFolder = async (userId, folderName, parentId = null) => {
    const createdFolder = await folderRepository.createFolder(
        userId,
        folderName,
        parentId
    )

    return createdFolder
}

exports.getFolderData = async (folderId, ownerId) => {
    const folder = await folderRepository.getFolderById(folderId, {
        includeChildren: true,
    })

    if (!folder) {
        throw new createHttpError.NotFound("Folder not found")
    }

    if (folder.ownerId !== ownerId) {
        throw new createHttpError.Unauthorized("Forbidden")
    }

    let breadcrumbs = []
    if (folder) {
        breadcrumbs = await getFolderBreadcrumbs(folderId)
    }

    const filesJson = stringifyBigInt(
        folder.childFiles
            .filter((f) => f.type === FileType.FILE)
            .map((file) => {
                return { ...file, createdAt: file.createdAt.toDateString() }
            })
    )

    const sidebarTree = await getSidebarFoldersTree(ownerId)

    return {
        folder,
        breadcrumbs,
        filesJson,
        sidebarTree,
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
                id: id,
            })

            if (!treeNode.childFiles || treeNode.childFiles.length <= 0) {
                break
            }
            treeNode = treeNode.childFiles[0]
        }
    }
    breadCrumbs.unshift({
        name: "Home",
        link: "/home",
        current: false,
        id: -1,
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

    await deleteFolderTree(deletedFolderTree)

    return deletedFolder
}

async function deleteFolderTree(folderTree) {
    if (!folderTree) {
        return
    }

    const { type, id, childFiles, level } = folderTree
    if (level > 0 && type === FileType.FILE) {
        // Prisma client extension for file path doesn't work when results come from a custom SQL query ?
        // We compute the file path manually instead
        const filePath = computeFilePath(id)
        await storageService.deleteFile(filePath)
    }

    if (childFiles) {
        childFiles.forEach((child) => deleteFolderTree(child))
    }
}

exports.moveIntoFolder = async (folderId, newParentId) => {
    return folderRepository.moveIntoFolder(folderId, newParentId)
}
