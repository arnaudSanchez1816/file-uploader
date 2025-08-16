class FileDetailsDialog {
    #dialog

    constructor(htmlElement) {
        if (htmlElement instanceof HTMLElement) {
            this.#dialog = htmlElement
        } else {
            this.#dialog = document.querySelector(htmlElement)
        }

        if (!this.#dialog) {
            throw new Error(
                "File details dialog element provided is undefined or null."
            )
        }
    }

    showFile({ id, name, createdAt, size }) {
        if (!this.#dialog) {
            console.error("File details dialog element is invalid !")
            return
        }

        const dialog = this.#dialog

        const fileNames = [...dialog.querySelectorAll(".file-name")]
        fileNames.forEach((element) => (element.textContent = name))

        const fileSizes = [...dialog.querySelectorAll(".file-size")]
        fileSizes.forEach((element) => (element.textContent = size))

        const fileCreated = [...dialog.querySelectorAll(".file-created")]
        fileCreated.forEach((element) => (element.textContent = createdAt))

        const downloadLink = dialog.querySelector("a.download")
        downloadLink.href = `/files/${id}`

        const deleteForm = dialog.querySelector("form.delete")
        deleteForm.action = `/files/${id}?_method=DELETE`

        dialog.showModal()
    }
}

module.exports = FileDetailsDialog
