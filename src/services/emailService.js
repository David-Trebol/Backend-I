const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        // Configuración del transportador de correo
        this.transporter = nodemailer.createTransporter({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false, // true para 465, false para otros puertos
            auth: {
                user: process.env.SMTP_USER || 'tu-email@gmail.com',
                pass: process.env.SMTP_PASS || 'tu-password-de-aplicacion'
            }
        });
    }

    // Método para enviar email de recuperación de contraseña
    async sendPasswordResetEmail(user, resetToken, resetUrl) {
        const mailOptions = {
            from: `"${process.env.APP_NAME || 'Mi Aplicación'}" <${process.env.SMTP_USER || 'noreply@miapp.com'}>`,
            to: user.email,
            subject: 'Recuperación de Contraseña',
            html: this.generatePasswordResetHTML(user, resetUrl),
            text: this.generatePasswordResetText(user, resetUrl)
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email enviado: %s', info.messageId);
            return true;
        } catch (error) {
            console.error('Error enviando email:', error);
            return false;
        }
    }

    // Generar HTML para el email de recuperación
    generatePasswordResetHTML(user, resetUrl) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Recuperación de Contraseña</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .header {
                        background-color: #007bff;
                        color: white;
                        padding: 20px;
                        text-align: center;
                        border-radius: 5px 5px 0 0;
                    }
                    .content {
                        background-color: #f8f9fa;
                        padding: 30px;
                        border-radius: 0 0 5px 5px;
                    }
                    .button {
                        display: inline-block;
                        background-color: #007bff;
                        color: white;
                        padding: 12px 30px;
                        text-decoration: none;
                        border-radius: 5px;
                        margin: 20px 0;
                        font-weight: bold;
                    }
                    .button:hover {
                        background-color: #0056b3;
                    }
                    .warning {
                        background-color: #fff3cd;
                        border: 1px solid #ffeaa7;
                        color: #856404;
                        padding: 15px;
                        border-radius: 5px;
                        margin: 20px 0;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        color: #666;
                        font-size: 12px;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🔐 Recuperación de Contraseña</h1>
                </div>
                
                <div class="content">
                    <h2>Hola ${user.first_name} ${user.last_name},</h2>
                    
                    <p>Has solicitado restablecer tu contraseña. Si no realizaste esta solicitud, puedes ignorar este correo.</p>
                    
                    <p>Para restablecer tu contraseña, haz clic en el siguiente botón:</p>
                    
                    <div style="text-align: center;">
                        <a href="${resetUrl}" class="button">
                            🔑 Restablecer Contraseña
                        </a>
                    </div>
                    
                    <div class="warning">
                        <strong>⚠️ Importante:</strong>
                        <ul>
                            <li>Este enlace expirará en 1 hora</li>
                            <li>No compartas este enlace con nadie</li>
                            <li>Si no solicitaste este cambio, ignora este correo</li>
                        </ul>
                    </div>
                    
                    <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                    <p style="word-break: break-all; color: #007bff;">${resetUrl}</p>
                </div>
                
                <div class="footer">
                    <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
                    <p>© ${new Date().getFullYear()} ${process.env.APP_NAME || 'Mi Aplicación'}. Todos los derechos reservados.</p>
                </div>
            </body>
            </html>
        `;
    }

    // Generar texto plano para el email de recuperación
    generatePasswordResetText(user, resetUrl) {
        return `
            Recuperación de Contraseña
            
            Hola ${user.first_name} ${user.last_name},
            
            Has solicitado restablecer tu contraseña. Si no realizaste esta solicitud, puedes ignorar este correo.
            
            Para restablecer tu contraseña, visita el siguiente enlace:
            ${resetUrl}
            
            ⚠️ IMPORTANTE:
            - Este enlace expirará en 1 hora
            - No compartas este enlace con nadie
            - Si no solicitaste este cambio, ignora este correo
            
            Este es un correo automático, por favor no respondas a este mensaje.
            
            © ${new Date().getFullYear()} ${process.env.APP_NAME || 'Mi Aplicación'}. Todos los derechos reservados.
        `;
    }

    // Método para enviar email de confirmación de cambio de contraseña
    async sendPasswordChangedEmail(user) {
        const mailOptions = {
            from: `"${process.env.APP_NAME || 'Mi Aplicación'}" <${process.env.SMTP_USER || 'noreply@miapp.com'}>`,
            to: user.email,
            subject: 'Contraseña Cambiada Exitosamente',
            html: this.generatePasswordChangedHTML(user),
            text: this.generatePasswordChangedText(user)
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email de confirmación enviado: %s', info.messageId);
            return true;
        } catch (error) {
            console.error('Error enviando email de confirmación:', error);
            return false;
        }
    }

    // Generar HTML para el email de confirmación
    generatePasswordChangedHTML(user) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Contraseña Cambiada</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .header {
                        background-color: #28a745;
                        color: white;
                        padding: 20px;
                        text-align: center;
                        border-radius: 5px 5px 0 0;
                    }
                    .content {
                        background-color: #f8f9fa;
                        padding: 30px;
                        border-radius: 0 0 5px 5px;
                    }
                    .success {
                        background-color: #d4edda;
                        border: 1px solid #c3e6cb;
                        color: #155724;
                        padding: 15px;
                        border-radius: 5px;
                        margin: 20px 0;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        color: #666;
                        font-size: 12px;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>✅ Contraseña Cambiada</h1>
                </div>
                
                <div class="content">
                    <h2>Hola ${user.first_name} ${user.last_name},</h2>
                    
                    <div class="success">
                        <strong>✅ Tu contraseña ha sido cambiada exitosamente</strong>
                    </div>
                    
                    <p>Tu contraseña ha sido actualizada correctamente. Si no realizaste este cambio, contacta inmediatamente con soporte.</p>
                    
                    <p>Fecha y hora del cambio: ${new Date().toLocaleString('es-ES')}</p>
                </div>
                
                <div class="footer">
                    <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
                    <p>© ${new Date().getFullYear()} ${process.env.APP_NAME || 'Mi Aplicación'}. Todos los derechos reservados.</p>
                </div>
            </body>
            </html>
        `;
    }

    // Generar texto plano para el email de confirmación
    generatePasswordChangedText(user) {
        return `
            Contraseña Cambiada
            
            Hola ${user.first_name} ${user.last_name},
            
            ✅ Tu contraseña ha sido cambiada exitosamente
            
            Tu contraseña ha sido actualizada correctamente. Si no realizaste este cambio, contacta inmediatamente con soporte.
            
            Fecha y hora del cambio: ${new Date().toLocaleString('es-ES')}
            
            Este es un correo automático, por favor no respondas a este mensaje.
            
            © ${new Date().getFullYear()} ${process.env.APP_NAME || 'Mi Aplicación'}. Todos los derechos reservados.
        `;
    }
}

module.exports = EmailService; 