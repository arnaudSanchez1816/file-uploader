const express = require("express")
const folderController = require("../controllers/folderController")

const router = express.Router()

router
    .route("/:folderId")
    .get(folderController.getFolder)
    .delete(folderController.deleteFolder)
router.post("/:folderId/move", folderController.moveFolder)
router.post("/", folderController.createFolder)

module.exports = router
