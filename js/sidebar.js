const NewFileDialog = require("./newFileDialog")

const newFileBtns = [...document.querySelectorAll(".open-new-file")]
if (newFileBtns.length > 0) {
    const newFileDialog = new NewFileDialog("#new-file-dialog")

    newFileBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            newFileDialog.show()
        })
    })
}

const newFolderBtns = [...document.querySelectorAll(".open-new-folder")]
if (newFolderBtns.length > 0) {
    const newFolderDialog = document.querySelector("#new-folder-dialog")

    newFolderBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            newFolderDialog.showModal()
        })
    })
}

const deleteFolderBtns = [...document.querySelectorAll(".open-delete-folder")]
if (deleteFolderBtns.length > 0) {
    const deleteFolderDialog = document.querySelector("#delete-folder-dialog")
    deleteFolderBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            deleteFolderDialog.showModal()
        })
    })
}
const shareFolderBtns = [...document.querySelectorAll(".open-share-folder")]
if (shareFolderBtns.length > 0) {
    const shareFolderDialog = document.querySelector("#share-folder-dialog")
    shareFolderBtns.forEach((btn) => {
        btn.addEventListener("click", () => shareFolderDialog.showModal())
    })
}
