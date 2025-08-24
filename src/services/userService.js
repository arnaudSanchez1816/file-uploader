const userRepository = require("../repositories/userRepository")

exports.getUserById = (id, { includeFiles = false } = {}) => {
    return userRepository.getUserById(id, { includeFiles })
}

exports.getUserByEmail = async (email, { includeFiles = false } = {}) => {
    return userRepository.getUserByEmail(email, { includeFiles })
}

exports.emailIsUsed = async (userEmail) => {
    const user = await userRepository.getUserByEmail(userEmail)
    return user !== null
}

exports.createNewUser = async (email, password) => {
    return userRepository.createNewUser({ email, password })
}
