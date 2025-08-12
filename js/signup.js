function clearServerError(inputElement) {
    const errorElement = document.querySelector(
        `p[data-error='${inputElement.name}']`
    )
    if (errorElement) {
        errorElement.remove()
    }
    inputElement.classList.remove("input-error")
}

const passwordConfirmation = (function () {
    const passwordConfirmationInput = document.querySelector(
        "#signup-confirm-password"
    )
    const passwordConfirmationHint = document.querySelector(
        "#signup-confirm-password+.validator-hint"
    )
    const passwordInput = document.querySelector("#signup-password")

    const isValid = () => {
        clearServerError(passwordConfirmationInput)
        passwordConfirmationInput.setCustomValidity("")
        const confirmValue = passwordConfirmationInput.value
        const passwordValue = passwordInput.value

        if (confirmValue !== passwordValue) {
            const message = passwordConfirmationHint.textContent
            passwordConfirmationInput.setCustomValidity(message.trim())
            return false
        }

        return true
    }

    passwordConfirmationInput.addEventListener(
        "input",
        () => clearServerError(passwordConfirmationInput),
        { once: true }
    )
    passwordConfirmationInput.addEventListener(
        "invalid",
        () => clearServerError(passwordConfirmationInput),
        { once: true }
    )

    passwordConfirmationInput.addEventListener("input", () => {
        isValid()
    })

    return { isValid }
})()

const email = (function () {
    const emailInput = document.querySelector("#signup-email")

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
    const passwordInput = document.querySelector("#signup-password")

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

const form = document.querySelector("form[action='/signup']")
form.addEventListener("submit", (e) => {
    if (!email.isValid()) {
        e.preventDefault()
        form.reportValidity()
        return
    }
    if (!password.isValid()) {
        e.preventDefault()
        form.reportValidity()
        return
    }

    if (!passwordConfirmation.isValid()) {
        e.preventDefault()
        form.reportValidity()
        return
    }
})
