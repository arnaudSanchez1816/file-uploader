const express = require("express")
const sharedController = require("../controllers/sharedController")

const router = express.Router()

router.get("/:sharedId/", sharedController.renderSharedRoot)
router.get("/:sharedId/folder/:folderId", sharedController.renderSharedFolder)
router.get("/:sharedId/file/:fileId", sharedController.downloadSharedFile)

module.exports = router
