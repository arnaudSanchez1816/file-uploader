const INVALID_FILE_SIZE = "File is too big."
const ONE_FILE_MAXIMUM = "Multiple files upload is not allowed."
const FILE_REQUIRED = "File required."
const MAX_FILE_SIZE = 5242880 // 5 MB

class NewFileDialog {
    #dialog

    constructor(htmlElement) {
        if (htmlElement instanceof HTMLElement) {
            this.#dialog = htmlElement
        } else {
            this.#dialog = document.querySelector(htmlElement)
        }

        if (!this.#dialog) {
            throw new Error(
                "New file dialog element provided is undefined or null."
            )
        }

        const checkValidity = this.#checkValidity.bind(this)

        const fileInput = this.#dialog.querySelector("input.file-input")

        if (fileInput) {
            fileInput.addEventListener("change", () => {
                checkValidity(fileInput)
            })
        }

        const form = this.#dialog.querySelector("#new-file-form")
        if (form) {
            form.addEventListener("submit", (e) => {
                checkValidity(fileInput)
                if (!fileInput.validity.valid) {
                    e.preventDefault()
                }
            })
        }
    }

    show() {
        this.#dialog.showModal()
    }

    #checkValidity(fileInput) {
        const validatorHint = this.#dialog.querySelector(".validator-hint")

        fileInput.setCustomValidity("")
        validatorHint.textContent = ""

        const files = [...fileInput.files]
        if (files.length <= 0) {
            fileInput.setCustomValidity(FILE_REQUIRED)
            validatorHint.textContent = FILE_REQUIRED
            return
        }

        if (files.length > 1) {
            fileInput.setCustomValidity(ONE_FILE_MAXIMUM)
            validatorHint.textContent = ONE_FILE_MAXIMUM
            return
        }

        const file = files[0]
        if (file.size > MAX_FILE_SIZE) {
            fileInput.setCustomValidity(INVALID_FILE_SIZE)
            validatorHint.textContent = INVALID_FILE_SIZE
            return
        }
    }
}

module.exports = NewFileDialog
