// Create an image and use it for the drag image
// Use the image URL that you desire
const folderDragImg = new Image()
folderDragImg.src = "/img/mdi--folder-move-outline.png"

const dragTargets = [
    ...document.querySelectorAll(".drag-target[draggable=true]"),
]

const dropTargets = document.querySelectorAll(".drop-target")

function toggleDragTargets(enabled) {
    for (const target of dropTargets) {
        target.classList.toggle("hidden", !enabled)
    }
}

function toggleDropTargetOutline(target, enabled) {
    target.classList.toggle("outline-dotted", enabled)
    target.classList.toggle("outline-hidden", !enabled)
}

dragTargets.forEach((folder) => {
    folder.addEventListener("dragstart", (ev) => {
        ev.dataTransfer.setData("text/plain", ev.target.dataset.id)
        ev.dataTransfer.setData(
            "application/action-type",
            ev.target.classList.contains("file") ? "files" : "folders"
        )
        ev.dataTransfer.effectAllowed = "move"
        ev.dataTransfer.dropEffect = "move"
        ev.dataTransfer.setDragImage(folderDragImg, 28, 22)
        toggleDragTargets(true)
    })

    folder.addEventListener("dragend", () => {
        toggleDragTargets(false)
    })
})

for (const target of dropTargets) {
    target.addEventListener("dragover", (ev) => {
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

        toggleDropTargetOutline(
            ev.target,
            ev.dataTransfer.dropEffect === "move"
        )
    })
    target.addEventListener("dragleave", (ev) => {
        ev.preventDefault()
        toggleDropTargetOutline(ev.target, false)
    })

    target.addEventListener("drop", (ev) => {
        ev.preventDefault()

        toggleDropTargetOutline(ev.target, false)
        // Setup move form
        const data = ev.dataTransfer.getData("text/plain")
        const actionType = ev.dataTransfer.getData("application/action-type")
        const form = document.createElement("form")
        form.action = `/${actionType}/${data}/move`
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
