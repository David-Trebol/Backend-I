const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const UserManager = require('../managers/UserManager');
const { comparePassword } = require('../utils/hash.utils');

const userManager = new UserManager();

// Estrategia de registro
passport.use('register', new LocalStrategy({
    usernameField: 'email',
    passReqToCallback: true
}, async (req, email, password, done) => {
    try {
        const user = await userManager.getUserByEmail(email);
        if (user) return done(null, false, { message: 'El email ya está registrado' });
        const newUser = await userManager.addUser({ ...req.body, email, password });
        return done(null, newUser);
    } catch (error) {
        return done(error);
    }
}));

// Estrategia de login
passport.use('login', new LocalStrategy({
    usernameField: 'email',
    passReqToCallback: false
}, async (email, password, done) => {
    try {
        const user = await userManager.getUserByEmail(email);
        if (!user) return done(null, false, { message: 'Usuario no encontrado' });
        const valid = comparePassword(password, user.password);
        if (!valid) return done(null, false, { message: 'Contraseña incorrecta' });
        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

// Serialización y deserialización
passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await userManager.getUserById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

module.exports = passport; 