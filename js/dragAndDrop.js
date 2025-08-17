// Create an image and use it for the drag image
// Use the image URL that you desire
const folderDragImg = new Image()
folderDragImg.src = "/img/mdi--folder-move-outline.png"

const draggableFolders = [
    ...document.querySelectorAll(".folder[draggable=true]"),
]

const dragTargets = document.querySelectorAll(".drop-target")

function toggleDragTargets(enabled) {
    for (const target of dragTargets) {
        target.classList.toggle("hidden", !enabled)
    }
}

draggableFolders.forEach((folder) => {
    folder.addEventListener("dragstart", (ev) => {
        ev.dataTransfer.setData("text/plain", ev.target.dataset.id)
        ev.dataTransfer.effectAllowed = "move"
        ev.dataTransfer.dropEffect = "move"
        ev.dataTransfer.setDragImage(folderDragImg, 28, 22)
        toggleDragTargets(true)
    })

    folder.addEventListener("dragend", () => {
        toggleDragTargets(false)
    })
})

for (const target of dragTargets) {
    target.addEventListener("dragover", (ev) => {
        console.log(ev.dataTransfer.dropEffect)
        ev.preventDefault()
        const targetId = ev.dataTransfer.getData("text/plain")
        const dropId = ev.target.dataset.id
        ev.dataTransfer.dropEffect = targetId !== dropId ? "move" : "none"
    })
    target.addEventListener("dragenter", (ev) => {
        ev.preventDefault()
        const targetId = ev.dataTransfer.getData("text/plain")
        const dropId = ev.target.dataset.id
        ev.dataTransfer.dropEffect = targetId !== dropId ? "move" : "none"

        if (ev.dataTransfer.dropEffect === "move") {
            target.classList.add("outline-dashed")
        }
    })
    target.addEventListener("dragleave", (ev) => {
        ev.preventDefault()
        target.classList.remove("outline-dashed")
    })

    target.addEventListener("drop", (ev) => {
        ev.preventDefault()
        // Get the id of the target and add the moved element to the target's DOM
        const data = ev.dataTransfer.getData("text/plain")
        target.classList.remove("outline-dashed")
        //ev.target.appendChild(document.getElementById(data))
        const form = document.createElement("form")
        form.action = `/folders/${data}/move`
        form.method = "POST"
        const newParentInput = document.createElement("input")
        newParentInput.type = "hidden"
        newParentInput.name = "newParentId"
        newParentInput.value = ev.target.dataset.id
        form.append(newParentInput)
        document.body.append(form)
        form.submit()
    })
}
