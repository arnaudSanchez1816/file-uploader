const { param, validationResult, matchedData } = require("express-validator")
const createHttpError = require("http-errors")
const sharedService = require("../services/sharedService")
const storageService = require("../services/storage/storageService")

const validateSharedId = () => param("sharedId").exists().isULID()

exports.renderSharedRoot = [
    validateSharedId(),
    async (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            throw new createHttpError.BadRequest()
        }
        const { sharedId } = matchedData(req)

        const sharedData = await sharedService.getFolderData(sharedId)

        return res.render("sharedFolder", { ...sharedData })
    },
]

exports.renderSharedFolder = [
    validateSharedId(),
    param("folderId").exists().isInt({ min: 1 }).toInt(),
    async (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            throw new createHttpError.BadRequest()
        }
        const { sharedId, folderId } = matchedData(req)

        const sharedData = await sharedService.getFolderData(sharedId, folderId)

        return res.render("sharedFolder", { ...sharedData })
    },
]

exports.downloadSharedFile = [
    validateSharedId(),
    param("fileId").exists().isInt({ min: 1 }).toInt(),
    async (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            throw new createHttpError.BadRequest()
        }

        const { sharedId, fileId } = matchedData(req)

        const file = await sharedService.getSharedFile(sharedId, fileId)

        const downloadUrl = await storageService.getDownloadUrl(
            file.path,
            file.name
        )

        if (storageService.strategyName === "local") {
            // In local strategy, the download url is just the absolute path to the file
            return res.download(downloadUrl, file.name)
        }

        res.redirect(downloadUrl)
    },
]
