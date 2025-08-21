const multer = require("multer")
const fileService = require("../services/fileService")
const folderService = require("../services/folderService")
const storageService = require("../services/storage/storageService")
const {
    param,
    matchedData,
    validationResult,
    body,
} = require("express-validator")
const createHttpError = require("http-errors")
const { FileType } = require("../generated/prisma")
const { fromBuffer } = require("file-type")

const MAX_FILE_SIZE = 5242880 // 5 MB
const ALLOWED_FILES_MIME_TYPES = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif",
    "image/avif",
    "image/apng",
]
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { files: 1, fileSize: MAX_FILE_SIZE },
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
            const errors = validationResult(req)

            const userId = req.user.id
            const { parentId } = matchedData(req)
            const { file } = req

            if (!errors.isEmpty()) {
                req.flash("error", { msg: "Something wrong happened." })
                return res.redirect(parentId ? `/folders/${parentId}` : "/home")
            }

            const fileType = await fromBuffer(file.buffer)
            if (
                !fileType ||
                !ALLOWED_FILES_MIME_TYPES.includes(fileType.mime)
            ) {
                req.flash("error", { msg: "Unsupported file type." })
                return res.redirect(parentId ? `/folders/${parentId}` : "/home")
            }
            // Replace multer mimetype with file-type one, it seems it is more reliable
            // Probably unnecessary since we only allow image/* files
            file.mimetype = fileType.mime

            const createdFile = await fileService.uploadFile({
                userId,
                file,
                parentId,
            })

            res.redirect(parentId ? `/folders/${parentId}` : "/home")
        } catch (error) {
            next(error)
        }
    },
]

exports.deleteFile = [
    fileIdValidation(),
    async (req, res, next) => {
        try {
            const errors = validationResult(req)

            if (!errors.isEmpty()) {
                throw new createHttpError.BadRequest()
            }

            const { fileId } = matchedData(req)
            const userId = req.user.id

            const file = await fileService.getFileById(fileId)
            if (!file) {
                throw new createHttpError.NotFound()
            }
            if (file.ownerId !== userId) {
                throw new createHttpError.Unauthorized()
            }

            await fileService.deleteFile(userId, fileId)
            res.redirect(
                file.parentId !== null ? `/folders/${file.parentId}` : "/home"
            )
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
            const file = await fileService.getFileById(fileId)
            if (!file) {
                throw new createHttpError.NotFound()
            }
            if (file.ownerId !== userId) {
                throw new createHttpError.Unauthorized()
            }

            const downloadUrl = await storageService.getDownloadUrl(
                file.path,
                file.name
            )

            if (storageService.strategyName === "local") {
                // In local strategy, the download url is just the absolute path to the file
                return res.download(downloadUrl, file.name)
            }

            res.redirect(downloadUrl)
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
