const createHttpError = require("http-errors")
const folderRepository = require("../repositories/folderRepository")
const fileRepository = require("../repositories/fileRepository")
const sharedRepository = require("../repositories/sharedRepository")
const { stringifyBigInt } = require("../utils/jsonUtils")
const { FileType } = require("../generated/prisma")
const { getSidebarFoldersTree } = require("./homeService")

exports.getFolderData = async (sharedId, folderId = null) => {
    const shared = await sharedRepository.getShared(sharedId)
    if (!shared) {
        throw new createHttpError.NotFound("Shared link not found")
    }

    const sharedRootId = shared.fileId
    const sharedOwnerId = shared.file.ownerId
    if (!folderId) {
        folderId = sharedRootId
    }

    const folder = await folderRepository.getFolderById(folderId, {
        includeChildren: true,
    })

    if (!folder) {
        throw new createHttpError.NotFound("Folder not found")
    }

    updateToSharedLinks(folder, sharedId)

    const breadcrumbs = await getFolderBreadcrumbs({
        sharedId,
        folderId,
        sharedRootId,
    })

    const filesJson = stringifyBigInt(
        folder.childFiles
            .filter((f) => f.type === FileType.FILE)
            .map((file) => {
                return { ...file, createdAt: file.createdAt.toDateString() }
            })
    )

    const sidebarTree = await getSidebarFoldersTree(sharedOwnerId, sharedRootId)
    updateSidebarTreeFolderLinks(sidebarTree, sharedId)

    const sharedDetails = {
        expiresAt: shared.expiresAt,
        name: shared.file.name,
    }

    return {
        folder,
        filesJson,
        sidebarTree,
        breadcrumbs,
        sharedDetails,
    }
}

exports.getSharedFile = async (sharedId, fileId) => {
    const shared = await sharedRepository.getShared(sharedId)
    if (!shared) {
        throw new createHttpError.NotFound("Shared link not found.")
    }

    const file = await fileRepository.getFileById({ fileId })
    if (!file) {
        throw new createHttpError.NotFound("File not found.")
    }

    const fileIsShared = await checkFileIsShared(shared, fileId)
    if (!fileIsShared) {
        throw new createHttpError.Unauthorized()
    }

    return file
}

async function checkFileIsShared(shared, fileId) {
    const sharedRootId = shared.fileId
    const sharedRootTree = await folderRepository.getFolderTree(sharedRootId)

    const visited = [],
        stack = []

    stack.push(sharedRootTree)
    while (stack.length > 0) {
        const file = stack.pop()
        if (!visited.includes(file.id)) {
            if (file.id === fileId) {
                return true
            }

            visited.push(file.id)
            const children = file.childFiles
            for (const child of children) {
                stack.push(child)
            }
        }
    }

    return false
}

async function getFolderBreadcrumbs({ sharedId, folderId, sharedRootId }) {
    const breadCrumbs = []

    if (folderId !== null) {
        const folderTree = await folderRepository.getFolderTree(folderId)

        let treeNode = folderTree
        while (folderTree.id !== sharedRootId) {
            // Find shared folder root
            if (!treeNode.childFiles || treeNode.childFiles.length <= 0) {
                break
            }

            treeNode = treeNode.childFiles[0]
        }

        while (treeNode.level <= 0) {
            const { name, id, level } = treeNode
            breadCrumbs.push({
                name: name,
                link: `/shared/${sharedId}/folder/${id}`,
                current: level === 0,
                id: id,
            })

            if (!treeNode.childFiles || treeNode.childFiles.length <= 0) {
                break
            }
            treeNode = treeNode.childFiles[0]
        }
    }
    return breadCrumbs
}

function updateSidebarTreeFolderLinks(sidebarTree, sharedId) {
    if (!sidebarTree) {
        return
    }

    sidebarTree.link = `/shared/${sharedId}/folder/${sidebarTree.id}`
    for (const child of sidebarTree.folders) {
        updateSidebarTreeFolderLinks(child, sharedId)
    }
}

function updateToSharedLinks(folder, sharedId) {
    folder.link = `/shared/${sharedId}/folder/${folder.id}`
    for (const child of folder.childFiles) {
        child.link =
            child.type === FileType.FOLDER
                ? `/shared/${sharedId}/folder/${child.id}`
                : `/shared/${sharedId}/file/${child.id}`
    }
}
