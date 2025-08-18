const fs = require("fs/promises")
const path = require("path")

class LocalFileStorage {
    #rootPath

    constructor(rootPath) {
        if (!rootPath) {
            throw new Error("Root path is invalid.")
        }
        this.#rootPath = rootPath
    }

    async write(path, buffer) {
        return fs.writeFile(this.#toAbsolutePath(path), buffer)
    }

    async delete(path) {
        return fs.unlink(this.#toAbsolutePath(path))
    }

    async getDownloadUrl(path) {
        return this.#toAbsolutePath(path)
    }

    #toAbsolutePath(relativePath) {
        return path.join(this.#rootPath, relativePath)
    }

    get strategyName() {
        return "local"
    }
}

module.exports = LocalFileStorage
