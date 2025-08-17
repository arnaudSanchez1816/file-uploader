const multer = require("multer")
const fileService = require("../services/fileService")
const folderService = require("../services/folderService")
const {
    param,
    matchedData,
    validationResult,
    body,
} = require("express-validator")
const createHttpError = require("http-errors")
const { FileType } = require("../generated/prisma")

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { files: 1 },
})

const fileIdValidation = () =>
    param("fileId")
        .exists()
        .isInt({ min: 1 })
        .withMessage("Invalid or missing file id.")
        .toInt()

exports.uploadFile = [
    upload.single("file"),
    body("parentId")
        .default(null)
        .if(body("parentId").custom((value) => value !== null))
        .isInt({ min: 1 })
        .toInt(),
    async (req, res, next) => {
        try {
            const errors = validationResult(req).throw()

            const userId = req.user.id
            const { parentId } = matchedData(req)
            const { file } = req

            const createdFile = await fileService.uploadFile({
                userId,
                file,
                parentId,
            })

            res.redirect(parentId ? `/folders/${parentId}` : "/")
        } catch (error) {
            next(error)
        }
    },
]

exports.deleteFile = [
    fileIdValidation(),
    async (req, res, next) => {
        try {
            validationResult(req).throw()

            const { fileId } = matchedData(req)
            const userId = req.user.id

            const file = await fileService.getFileById(fileId, userId)
            if (!file) {
                throw new createHttpError.NotFound("File not found.")
            }

            await fileService.deleteFile(userId, fileId)
            res.redirect("/")
        } catch (error) {
            next(error)
        }
    },
]

exports.downloadFile = [
    fileIdValidation(),
    async (req, res, next) => {
        try {
            const { fileId } = matchedData(req)
            const userId = req.user.id
            const file = await fileService.getFileById(fileId, userId)
            res.download(file.path, file.name)
        } catch (error) {
            next(error)
        }
    },
]

exports.moveFile = [
    body("newParentId")
        .default(null)
        .if(body("newParentId").custom((value) => value !== null))
        .isInt({ min: 1 })
        .toInt(),
    param("fileId").exists().isInt({ min: 1 }).toInt(),
    async (req, res, next) => {
        const errors = validationResult(req).throw()

        const { fileId, newParentId } = matchedData(req)

        const userId = req.user.id

        const file = await fileService.getFileById(fileId)
        if (!file) {
            throw new createHttpError.NotFound("File does not exists.")
        }

        if (file.ownerId !== userId) {
            throw new createHttpError.Unauthorized()
        }

        if (newParentId !== null) {
            const parentFolder = await folderService.getFolderById(newParentId)
            if (!parentFolder) {
                throw new createHttpError.NotFound(
                    "New parent folder does not exists."
                )
            }

            if (
                parentFolder.ownerId !== userId ||
                parentFolder.type !== FileType.FOLDER
            ) {
                throw new createHttpError.Unauthorized()
            }
        }

        const movedFile = await fileService.moveIntoFolder(fileId, newParentId)
        if (!movedFile) {
            return res.redirect("/")
        }

        if (newParentId === null) {
            return res.redirect("/home")
        }
        return res.redirect(`/folders/${newParentId}`)
    },
]
