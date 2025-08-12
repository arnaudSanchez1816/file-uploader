exports.clearServerError = (inputElement) => {
    const errorElement = document.querySelector(
        `p[data-error='${inputElement.name}']`
    )
    if (errorElement) {
        errorElement.remove()
    }
    inputElement.classList.remove("input-error")
}
