const {
    param,
    validationResult,
    matchedData,
    body,
} = require("express-validator")
const folderService = require("../services/folderService")
const createHttpError = require("http-errors")

exports.getFolder = [
    param("folderId")
        .exists()
        .isInt({ min: 1 })
        .withMessage("Missing folder id.")
        .toInt(),
    async (req, res, next) => {
        validationResult(req).throw()

        const userId = req.user.id
        const { folderId } = matchedData(req)

        const { folder, breadcrumbs, filesJson, sidebarTree } =
            await folderService.getFolderData(folderId, userId)

        if (!folder) {
            throw new createHttpError.NotFound()
        }
        if (folder.ownerId !== userId) {
            throw new createHttpError.Unauthorized()
        }
        res.render("folder", {
            folder,
            breadcrumbs,
            filesJson,
            sidebarTree,
        })
    },
]

exports.createFolder = [
    body("parentId")
        .default(null)
        .if(body("parentId").custom((value) => value !== null))
        .isInt({ min: 1 })
        .toInt(),
    body("folderName").exists().trim().escape().isString(),
    async (req, res, next) => {
        validationResult(req).throw()
        const { folderName, parentId } = matchedData(req)
        const userId = req.user.id

        const folder = await folderService.createFolder(
            userId,
            folderName,
            parentId
        )

        res.redirect(`/folders/${folder.id}`)
    },
]

exports.deleteFolder = [
    param("folderId").exists().isInt({ min: 1 }).toInt(),
    async (req, res, next) => {
        const errors = validationResult(req).throw()

        const { folderId } = matchedData(req)
        const userId = req.user.id

        const folder = await folderService.getFolderById(folderId)
        if (!folder) {
            throw new createHttpError.NotFound("Folder does not exists.")
        }
        if (folder.ownerId !== userId) {
            throw new createHttpError.Unauthorized()
        }

        const deletedFolder = await folderService.deleteFolder(folderId)
        if (!deletedFolder) {
            return res.redirect("/")
        }

        return res.redirect(
            deletedFolder.parentId ? `/folders/${deletedFolder.parentId}` : "/"
        )
    },
]

exports.moveFolder = [
    body("newParentId")
        .default(null)
        .if(body("newParentId").custom((value) => value !== null))
        .isInt({ min: 1 })
        .toInt(),
    param("folderId").exists().isInt({ min: 1 }).toInt(),
    async (req, res, next) => {
        const errors = validationResult(req).throw()

        const { folderId, newParentId } = matchedData(req)

        const userId = req.user.id

        const folder = await folderService.getFolderById(folderId)
        if (!folder) {
            throw new createHttpError.NotFound("Folder does not exists.")
        }

        if (folder.ownerId !== userId) {
            throw new createHttpError.Unauthorized()
        }

        if (newParentId !== null) {
            const parentFolder = await folderService.getFolderById(newParentId)
            if (!parentFolder) {
                throw new createHttpError.NotFound(
                    "New parent folder does not exists."
                )
            }

            if (parentFolder.ownerId !== userId) {
                throw new createHttpError.Unauthorized()
            }
        }

        const movedFolder = await folderService.moveFolder(
            folderId,
            newParentId
        )
        if (!movedFolder) {
            return res.redirect("/")
        }

        if (newParentId === null) {
            return res.redirect("/home")
        }
        return res.redirect(`/folders/${newParentId}`)
    },
]
