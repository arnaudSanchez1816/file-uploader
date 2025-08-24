const FileDetailsDialog = require("../fileDetailsDialog")
const { parseBigInt } = require("../helpers")
const ToastContainer = require("../toastContainer")

const files = parseBigInt(document.querySelector("#files-data").textContent)
const fileDetails = new FileDetailsDialog("#file-details-dialog")

const filesButtons = [...document.querySelectorAll("button.file")]

filesButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        const fileId = btn.dataset.id
        if (!fileId) {
            throw new Error(`No id specified for this file button (${btn}).`)
        }
        const file = files.filter((file) => file.id === +fileId)[0]
        fileDetails.showFile(file)
    })
})

const toasts = new ToastContainer(".toast")
toasts.hide(5000)
