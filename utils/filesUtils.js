const path = require("path")

exports.computeFilePath = (fileId) => {
    return path.join(process.env.FILES_DATA_PATH, fileId)
}
