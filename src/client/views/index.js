const { clearServerError } = require("../helpers")

const email = (function () {
    const emailInput = document.querySelector("#login-email")

    emailInput.addEventListener("input", () => clearServerError(emailInput), {
        once: true,
    })
    emailInput.addEventListener("invalid", () => clearServerError(emailInput), {
        once: true,
    })

    const isValid = () => {
        return emailInput.validity.valid
    }

    return { isValid }
})()

const password = (function () {
    const passwordInput = document.querySelector("#login-password")

    passwordInput.addEventListener(
        "input",
        () => clearServerError(passwordInput),
        {
            once: true,
        }
    )
    passwordInput.addEventListener(
        "invalid",
        () => clearServerError(passwordInput),
        {
            once: true,
        }
    )

    const isValid = () => {
        return passwordInput.validity.valid
    }

    return { isValid }
})()
