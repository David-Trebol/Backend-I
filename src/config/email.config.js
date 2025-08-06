// Configuración para el sistema de correo electrónico
module.exports = {
    // Configuración SMTP
    smtp: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false, // true para 465, false para otros puertos
        auth: {
            user: process.env.SMTP_USER || 'tu-email@gmail.com',
            pass: process.env.SMTP_PASS || 'tu-password-de-aplicacion'
        }
    },

    // Configuración de la aplicación
    app: {
        name: process.env.APP_NAME || 'Mi Aplicación',
        url: process.env.FRONTEND_URL || 'http://localhost:3000',
        email: process.env.APP_EMAIL || 'noreply@miapp.com'
    },

    // Configuración de tokens
    tokens: {
        expirationHours: 1, // 1 hora
        cleanupInterval: 24 * 60 * 60 * 1000 // 24 horas en milisegundos
    },

    // Configuración de emails
    emails: {
        from: `"${process.env.APP_NAME || 'Mi Aplicación'}" <${process.env.SMTP_USER || 'noreply@miapp.com'}>`,
        subject: {
            passwordReset: 'Recuperación de Contraseña',
            passwordChanged: 'Contraseña Cambiada Exitosamente'
        }
    }
}; 