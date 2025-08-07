exports.createFolderSchema = {
    parentId: {
        exists: { values: "undefined" },
        isInt: {
            min: 1,
        },
    },
}
