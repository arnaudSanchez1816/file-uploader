const {
    param,
    validationResult,
    matchedData,
    body,
} = require("express-validator")
const folderService = require("../services/folderService")
const createHttpError = require("http-errors")
const { FileType } = require("../generated/prisma/client")

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

        const folder = await folderService.getFolderById(folderId, {
            includeChildren: true,
        })
        if (!folder) {
            throw new createHttpError.NotFound()
        }
        if (folder.ownerId !== userId) {
            throw new createHttpError.Unauthorized()
        }

        res.render("folder", { folder, FileType })
    },
]

exports.createFolder = [
    body("parentId").optional({ values: "null" }).isInt({ min: 1 }),
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
