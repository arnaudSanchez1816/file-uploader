const NewFileDialog = require("./newFileDialog")

const newFileDialog = new NewFileDialog("#new-file-dialog")
const newFileBtns = [...document.querySelectorAll(".open-new-file")]

newFileBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        newFileDialog.show()
    })
})

const newFolderDialog = document.querySelector("#new-folder-dialog")
const newFolderBtns = [...document.querySelectorAll(".open-new-folder")]

newFolderBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        newFolderDialog.showModal()
    })
})

const deleteFolderDialog = document.querySelector("#delete-folder-dialog")
const deleteFolderBtns = [...document.querySelectorAll(".open-delete-folder")]

deleteFolderBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        deleteFolderDialog.showModal()
    })
})
