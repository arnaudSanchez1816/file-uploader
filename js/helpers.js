exports.clearServerError = (inputElement) => {
    const errorElement = document.querySelector(
        `p[data-error='${inputElement.name}']`
    )
    if (errorElement) {
        errorElement.remove()
    }
    inputElement.classList.remove("input-error")
}

exports.parseBigInt = (object) => {
    return JSON.parse(object, (key, value) => {
        if (!isNaN(+value) && !Number.isSafeInteger(+value)) {
            return BigInt(value)
        }
        return value
    })
}
