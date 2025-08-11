const passport = require("passport")
const { Strategy: LocalStrategy } = require("passport-local")
const userService = require("../services/userService")
const bcrypt = require("bcryptjs")

const INCORRECT_USERNAME_PASSWORD_MESSAGE = "Incorrect e-mail or password."

passport.use(
    new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password",
            passReqToCallback: false,
        },
        async (username, password, done) => {
            try {
                // Verify user
                const user = await userService.getUserByEmail({
                    email: username,
                })
                if (!user) {
                    return done(null, false, {
                        message: INCORRECT_USERNAME_PASSWORD_MESSAGE,
                    })
                }
                const passwordMatch = await bcrypt.compare(
                    password,
                    user.password
                )
                if (!passwordMatch) {
                    return done(null, false, {
                        message: INCORRECT_USERNAME_PASSWORD_MESSAGE,
                    })
                }

                return done(null, user)
            } catch (error) {
                done(error)
            }
        }
    )
)

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    try {
        const user = await userService.getUserById({ id: id })
        done(null, user)
    } catch (error) {
        done(error)
    }
})

module.exports = passport
