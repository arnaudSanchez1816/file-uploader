const newFileDialog = document.querySelector("#new-file-dialog")
const newFileBtns = [...document.querySelectorAll(".open-new-file")]

newFileBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        newFileDialog.showModal()
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
