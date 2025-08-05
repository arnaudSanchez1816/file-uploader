const express = require("express")
const fileController = require("../controllers/fileController")

const router = express.Router()

router.post("/", fileController.uploadFile)
router.delete("/:fileId", fileController.deleteFile)
router.get("/:fileId", fileController.downloadFile)

module.exports = router
