exports.stringifyBigInt = (object) => {
    return JSON.stringify(object, (key, value) => {
        if (typeof value === "bigint") {
            return value.toString()
        }
        return value
    })
}
