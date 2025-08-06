class UserDTO {
    constructor(user) {
        this.id = user._id || user.id;
        this.first_name = user.first_name;
        this.last_name = user.last_name;
        this.email = user.email;
        this.age = user.age;
        this.role = user.role;
        this.cart = user.cart;
        this.createdAt = user.createdAt;
        this.updatedAt = user.updatedAt;
    }

    // Método estático para crear DTO desde objeto plano
    static fromUser(user) {
        return new UserDTO(user);
    }

    // Método estático para crear DTO desde token JWT
    static fromToken(tokenData) {
        return new UserDTO({
            _id: tokenData.id,
            email: tokenData.email,
            role: tokenData.role
        });
    }

    // Método para obtener solo información pública (sin email)
    static toPublic(user) {
        const dto = new UserDTO(user);
        delete dto.email;
        return dto;
    }

    // Método para obtener información básica
    static toBasic(user) {
        return {
            id: user._id || user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role
        };
    }

    // Método para obtener información de perfil
    static toProfile(user) {
        return {
            id: user._id || user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            age: user.age,
            role: user.role,
            createdAt: user.createdAt
        };
    }

    // Método para obtener información de autenticación
    static toAuth(user) {
        return {
            id: user._id || user.id,
            email: user.email,
            role: user.role,
            first_name: user.first_name,
            last_name: user.last_name
        };
    }
}

module.exports = UserDTO; 