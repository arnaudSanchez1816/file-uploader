const prisma = require("../config/prisma").instance

exports.getShared = async (sharedId) => {
    const shared = await prisma.sharedFile.findUnique({
        where: {
            id: sharedId,
        },
        include: {
            file: {
                include: {
                    owner: true,
                },
            },
        },
    })

    if (shared) {
        const currentDate = new Date()
        if (shared.expiresAt < currentDate) {
            // Shared link is expired
            await this.deleteShared(sharedId)
            return null
        }
    }

    return shared
}

exports.deleteShared = async (sharedId) => {
    const deletedShared = await prisma.sharedFile.delete({
        where: {
            id: sharedId,
        },
    })

    return deletedShared
}
