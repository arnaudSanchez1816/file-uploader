const multer = require("multer")
const fileService = require("../services/fileService")
const { param, matchedData, validationResult } = require("express-validator")
const createHttpError = require("http-errors")

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
    async (req, res, next) => {
        try {
            const userId = req.user.id
            const { file } = req
            const createdFile = await fileService.uploadFile(userId, file)

            res.redirect("/")
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
