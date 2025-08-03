const passport = require("passport")
const { Strategy: LocalStrategy } = require("passport-local")
const prisma = require("../db/client")
const bcrypt = require("bcrypt")

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
                const user = await prisma.user.findUnique({
                    where: {
                        email: username,
                    },
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

module.exports = passport
