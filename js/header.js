function detectColorScheme() {
    let theme = "light" //default to light

    //local storage is used to override OS theme settings
    if (localStorage.getItem("theme")) {
        if (localStorage.getItem("theme") === "dark") {
            theme = "dark"
        }
    } else if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
        //OS theme setting detected as dark
        theme = "dark"
    }

    return theme
}

function applyTheme(theme, saveStorage = true) {
    document.documentElement.setAttribute("data-theme", theme)
    if (saveStorage) {
        localStorage.setItem("theme", theme)
    }
}

const themeController = document.querySelector(".theme-controller")
const theme = detectColorScheme()
if (themeController) {
    themeController.checked = theme === "dark"

    themeController.addEventListener("change", () => {
        const newTheme = themeController.checked ? "dark" : "light"
        applyTheme(newTheme, true)
    })
}

applyTheme(theme, false)
