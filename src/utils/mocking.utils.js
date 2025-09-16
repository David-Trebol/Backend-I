const bcrypt = require('bcrypt');

// Generador de mascotas de ejemplo (mockingpets)
const PET_SPECIES = ['dog', 'cat', 'hamster', 'parrot', 'turtle'];
const PET_NAMES = ['Firulais', 'Mishi', 'Pelusa', 'Rocky', 'Luna', 'Toby', 'Nina'];

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateMockPets = (count = 50) => {
    const pets = [];
    for (let i = 0; i < count; i++) {
        pets.push({
            id: i + 1,
            name: getRandomItem(PET_NAMES),
            species: getRandomItem(PET_SPECIES),
            age: Math.floor(Math.random() * 15) + 1,
        });
    }
    return pets;
};

// Generador de usuarios mock con contraseña encriptada "coder123"
const USER_FIRST_NAMES = ['Juan', 'María', 'Pedro', 'Lucía', 'Carlos', 'Ana', 'Sofía', 'Diego'];
const USER_LAST_NAMES = ['García', 'Pérez', 'López', 'Martínez', 'Rodríguez', 'Sánchez'];
const USER_ROLES = ['user', 'admin'];

const hashPasswordSync = (plain) => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(plain, salt);
};

const generateMockUsers = (count = 10) => {
    const users = [];
    const hashed = hashPasswordSync('coder123');
    for (let i = 0; i < count; i++) {
        const firstName = getRandomItem(USER_FIRST_NAMES);
        const lastName = getRandomItem(USER_LAST_NAMES);
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@mail.com`;
        users.push({
            first_name: firstName,
            last_name: lastName,
            email,
            role: getRandomItem(USER_ROLES),
            age: Math.floor(Math.random() * 50) + 18,
            password: hashed,
            pets: [],
        });
    }
    return users;
};

module.exports = {
    generateMockPets,
    generateMockUsers,
};

