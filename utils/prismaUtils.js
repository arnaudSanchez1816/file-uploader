exports.folderArrayToTree = function (list) {
    let map = {},
        root

    for (let i = 0; i < list.length; ++i) {
        const node = list[i]
        map[node.id] = i
        list[i].childFiles = []
        if (i !== 0) {
            const parentIndex = map[node.parentId]
            list[parentIndex].childFiles.push(node)
            node.parent = list[parentIndex]
        } else {
            root = node
        }
    }
    return root
}
