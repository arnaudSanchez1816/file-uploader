class ToastContainer {
    #container

    constructor(element) {
        if (element instanceof HTMLElement) {
            this.#container = element
        } else {
            this.#container = document.querySelector(element)
        }

        if (!this.#container) {
            throw new Error(
                "Toast container element provided is undefined or null."
            )
        }
    }

    hide(delay = 5000) {
        setTimeout(() => this.#container.remove(), delay)
    }
}

module.exports = ToastContainer
