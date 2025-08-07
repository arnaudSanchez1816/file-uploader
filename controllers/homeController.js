const homeService = require("../services/homeService")
const createHttpError = require("http-errors")
const { FileType } = require("../generated/prisma/client")

exports.getHome = async (req, res, next) => {
    const user = req.user
    try {
        const files = await homeService.getHomeData({ userId: user.id })
        res.render("home", { files, FileType })
    } catch (error) {
        throw createHttpError(500, error.message)
    }
}
