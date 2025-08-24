const LocalFileStorage = require("./localStorageStrategy")
const SupabaseStorageStrategy = require("./supabaseStorageStrategy")

const storageSt = process.env.STORAGE_STRATEGY
let storage
if (storageSt === "supabase") {
    storage = new SupabaseStorageStrategy(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_KEY,
        process.env.SUPABASE_FILES_BUCKET
    )
} else if (storageSt === "local") {
    storage = new LocalFileStorage(process.env.FILES_DATA_PATH)
}

if (!storage) {
    throw new Error("Failed to initialize storage, check your .env file.")
}

exports.writeFile = async (filePath, buffer, mimeType) => {
    return storage.write(filePath, buffer, mimeType)
}

exports.deleteFile = async (filePath) => {
    return storage.delete(filePath)
}

exports.getDownloadUrl = async (filePath, filename) => {
    return storage.getDownloadUrl(filePath, filename)
}

exports.strategyName = storage.strategyName
