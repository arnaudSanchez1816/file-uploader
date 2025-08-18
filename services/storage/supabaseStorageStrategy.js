const { createClient } = require("@supabase/supabase-js")
const { Readable } = require("stream")

class SupabaseStorageStrategy {
    #client
    #bucketName

    constructor(url, key, bucketName) {
        if (!url) {
            throw new Error("Supabase URL required")
        }
        if (!key) {
            throw new Error("Supabase Key required")
        }
        if (!bucketName) {
            throw new Error("Supabase Bucket required")
        }

        this.#bucketName = bucketName
        this.#client = createClient(url, key)
    }

    async write(path, buffer, mimeType) {
        const fileBlob = new Blob([buffer])
        const result = await this.#client.storage
            .from(this.#bucketName)
            .upload(path, Readable.from(buffer), {
                contentType: mimeType,
                duplex: "half",
            })

        if (result.error) {
            throw new Error(result.error)
        }
    }

    async delete(path) {
        const result = await this.#client.storage
            .from(this.#bucketName)
            .remove([path])
        if (result.error) {
            throw new Error(result.error)
        }
    }

    async getDownloadUrl(path, filename) {
        const result = await this.#client.storage
            .from(this.#bucketName)
            .createSignedUrl(path, 60, {
                download: filename,
            })
        if (result.error) {
            throw new Error(result.error)
        }

        return result.data.signedUrl
    }

    get strategyName() {
        return "supabase"
    }
}

module.exports = SupabaseStorageStrategy
