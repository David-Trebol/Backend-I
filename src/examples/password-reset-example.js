const PasswordResetService = require('../services/passwordResetService');
const UserManager = require('../managers/UserManager');

// Ejemplo de uso del sistema de recuperación de contraseña
async function ejemploPasswordReset() {
    const passwordResetService = new PasswordResetService();
    const userManager = new UserManager();

    try {
        console.log('=== Ejemplo de Sistema de Recuperación de Contraseña ===\n');

        // 1. Crear usuario de ejemplo
        console.log('1. Creando usuario de ejemplo...');
        const user = await userManager.addUser({
            first_name: 'María',
            last_name: 'López',
            email: 'maria@example.com',
            age: 30,
            password: 'password123'
        });

        console.log('Usuario creado:', user.first_name, user.last_name, `(${user.email})`);

        // 2. Solicitar recuperación de contraseña
        console.log('\n2. Solicitando recuperación de contraseña...');
        const requestResult = await passwordResetService.requestPasswordReset(user.email);
        console.log('Resultado de solicitud:', requestResult.message);

        // 3. Obtener estadísticas de tokens
        console.log('\n3. Obteniendo estadísticas de tokens...');
        const stats = await passwordResetService.getTokenStats();
        console.log('Estadísticas de tokens:', stats);

        // 4. Buscar token activo
        console.log('\n4. Buscando token activo...');
        const userTokens = await passwordResetService.tokenRepository.findByUser(user._id);
        const activeToken = userTokens.find(token => !token.used && !token.isExpired());
        
        if (activeToken) {
            console.log('Token encontrado:', activeToken.token.substring(0, 16) + '...');
            console.log('Expira en:', activeToken.expiresAt);

            // 5. Verificar token
            console.log('\n5. Verificando token...');
            const verifyResult = await passwordResetService.verifyResetToken(activeToken.token);
            console.log('Token válido:', verifyResult.valid);
            console.log('Usuario:', verifyResult.user.first_name, verifyResult.user.last_name);

            // 6. Intentar restablecer con la misma contraseña (debe fallar)
            console.log('\n6. Intentando restablecer con la misma contraseña...');
            try {
                await passwordResetService.resetPassword(activeToken.token, 'password123');
                console.log('❌ Error: Debería haber fallado');
            } catch (error) {
                console.log('✅ Correcto: Error esperado:', error.message);
            }

            // 7. Restablecer con nueva contraseña
            console.log('\n7. Restableciendo con nueva contraseña...');
            const resetResult = await passwordResetService.resetPassword(activeToken.token, 'nuevaPassword456');
            console.log('Resultado de restablecimiento:', resetResult.message);

            // 8. Verificar que el token ya no es válido
            console.log('\n8. Verificando que el token ya no es válido...');
            try {
                await passwordResetService.verifyResetToken(activeToken.token);
                console.log('❌ Error: Token debería ser inválido');
            } catch (error) {
                console.log('✅ Correcto: Token inválido como se esperaba');
            }

            // 9. Intentar restablecer con la nueva contraseña (debe fallar)
            console.log('\n9. Intentando restablecer con la contraseña actual...');
            try {
                await passwordResetService.resetPassword(activeToken.token, 'nuevaPassword456');
                console.log('❌ Error: Debería haber fallado');
            } catch (error) {
                console.log('✅ Correcto: Error esperado:', error.message);
            }

        } else {
            console.log('❌ No se encontró token activo');
        }

        // 10. Limpiar tokens expirados
        console.log('\n10. Limpiando tokens expirados...');
        const deletedCount = await passwordResetService.cleanupExpiredTokens();
        console.log('Tokens eliminados:', deletedCount);

        // 11. Estadísticas finales
        console.log('\n11. Estadísticas finales...');
        const finalStats = await passwordResetService.getTokenStats();
        console.log('Estadísticas finales:', finalStats);

        console.log('\n=== Ejemplo completado exitosamente ===');

    } catch (error) {
        console.error('Error en el ejemplo:', error.message);
    }
}

// Ejemplo de configuración de email
function ejemploConfiguracionEmail() {
    console.log('\n=== Configuración de Email ===\n');

    console.log('Para configurar el envío de emails, necesitas:');
    console.log('');
    console.log('1. Variables de entorno:');
    console.log('   SMTP_HOST=smtp.gmail.com');
    console.log('   SMTP_PORT=587');
    console.log('   SMTP_USER=tu-email@gmail.com');
    console.log('   SMTP_PASS=tu-password-de-aplicacion');
    console.log('   APP_NAME=Mi Aplicación');
    console.log('   FRONTEND_URL=http://localhost:3000');
    console.log('');
    console.log('2. Configuración Gmail:');
    console.log('   - Habilitar autenticación de 2 factores');
    console.log('   - Generar contraseña de aplicación');
    console.log('   - Usar la contraseña de aplicación en SMTP_PASS');
    console.log('');
    console.log('3. Archivo .env:');
    console.log('   SMTP_HOST=smtp.gmail.com');
    console.log('   SMTP_PORT=587');
    console.log('   SMTP_USER=tu-email@gmail.com');
    console.log('   SMTP_PASS=abcd efgh ijkl mnop');
    console.log('   APP_NAME=Mi Aplicación');
    console.log('   FRONTEND_URL=http://localhost:3000');
}

// Ejemplo de uso de las vistas
function ejemploVistas() {
    console.log('\n=== Vistas Disponibles ===\n');

    console.log('1. Solicitar recuperación:');
    console.log('   GET /forgot-password');
    console.log('   - Formulario para ingresar email');
    console.log('   - Validación en tiempo real');
    console.log('   - Indicadores de carga');
    console.log('');
    console.log('2. Restablecer contraseña:');
    console.log('   GET /reset-password?token=xxx');
    console.log('   - Verificación automática del token');
    console.log('   - Formulario para nueva contraseña');
    console.log('   - Requisitos de contraseña visibles');
    console.log('   - Redirección automática al login');
    console.log('');
    console.log('3. API Endpoints:');
    console.log('   POST /api/password-reset/request');
    console.log('   GET  /api/password-reset/verify/:token');
    console.log('   POST /api/password-reset/reset');
    console.log('   POST /api/password-reset/cancel');
    console.log('   GET  /api/password-reset/stats');
    console.log('   POST /api/password-reset/cleanup');
}

// Exportar funciones
module.exports = {
    ejemploPasswordReset,
    ejemploConfiguracionEmail,
    ejemploVistas
};

// Ejecutar ejemplos si el archivo se ejecuta directamente
if (require.main === module) {
    ejemploPasswordReset()
        .then(() => {
            ejemploConfiguracionEmail();
            ejemploVistas();
        })
        .catch(console.error);
} 