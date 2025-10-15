const express = require('express');
const router = express.Router();
const { authenticateAndGetUser } = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/authorization.middleware');
const Adoption = require('../models/Adoption');
const Pet = require('../models/Pet');
const User = require('../models/User');

/**
 * @swagger
 * components:
 *   schemas:
 *     Adoption:
 *       type: object
 *       required: [petId, adopterId, adoptionDate]
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único de la adopción
 *           example: "507f1f77bcf86cd799439011"
 *         petId:
 *           type: string
 *           description: ID de la mascota adoptada
 *           example: "507f1f77bcf86cd799439012"
 *         adopterId:
 *           type: string
 *           description: ID del adoptante
 *           example: "507f1f77bcf86cd799439013"
 *         adoptionDate:
 *           type: string
 *           format: date
 *           description: Fecha de adopción
 *           example: "2023-12-01"
 *         status:
 *           type: string
 *           enum: [pending, approved, completed, cancelled]
 *           description: Estado de la adopción
 *           example: "pending"
 *         notes:
 *           type: string
 *           description: Notas adicionales sobre la adopción
 *           example: "Familia con niños pequeños, casa con jardín"
 *         adoptionFee:
 *           type: number
 *           description: Tarifa de adopción
 *           example: 150.00
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *     AdoptionRequest:
 *       type: object
 *       required: [petId, notes]
 *       properties:
 *         petId:
 *           type: string
 *           description: ID de la mascota a adoptar
 *           example: "507f1f77bcf86cd799439012"
 *         notes:
 *           type: string
 *           description: Notas sobre la solicitud de adopción
 *           example: "Tengo experiencia con mascotas y una casa adecuada"
 *         adoptionFee:
 *           type: number
 *           description: Tarifa de adopción ofrecida
 *           example: 150.00
 */

/**
 * @swagger
 * /api/adoptions:
 *   get:
 *     summary: Obtener todas las adopciones
 *     description: Retorna una lista de todas las adopciones con filtros opcionales
 *     tags: [Adoptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, completed, cancelled]
 *         description: Filtrar por estado de adopción
 *       - in: query
 *         name: adopterId
 *         schema:
 *           type: string
 *         description: Filtrar por ID del adoptante
 *       - in: query
 *         name: petId
 *         schema:
 *           type: string
 *         description: Filtrar por ID de la mascota
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Número máximo de resultados
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número de página
 *     responses:
 *       200:
 *         description: Lista de adopciones obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Adopciones obtenidas exitosamente"
 *                 adoptions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Adoption'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 25
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', authenticateAndGetUser, async (req, res) => {
    try {
        const { status, adopterId, petId, limit = 10, page = 1 } = req.query;
        
        // Construir filtros
        const filter = {};
        if (status) filter.status = status;
        if (adopterId) filter.adopterId = adopterId;
        if (petId) filter.petId = petId;

        // Paginación
        const skip = (page - 1) * limit;
        
        const adoptions = await Adoption.find(filter)
            .populate('petId', 'name breed age')
            .populate('adopterId', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Adoption.countDocuments(filter);

        res.json({
            message: 'Adopciones obtenidas exitosamente',
            adoptions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/adoptions/{id}:
 *   get:
 *     summary: Obtener adopción por ID
 *     description: Retorna los detalles de una adopción específica
 *     tags: [Adoptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la adopción
 *     responses:
 *       200:
 *         description: Adopción obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Adopción obtenida exitosamente"
 *                 adoption:
 *                   $ref: '#/components/schemas/Adoption'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', authenticateAndGetUser, async (req, res) => {
    try {
        const adoption = await Adoption.findById(req.params.id)
            .populate('petId')
            .populate('adopterId');

        if (!adoption) {
            return res.status(404).json({ error: 'Adopción no encontrada' });
        }

        res.json({
            message: 'Adopción obtenida exitosamente',
            adoption
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/adoptions:
 *   post:
 *     summary: Crear nueva solicitud de adopción
 *     description: Permite a un usuario crear una solicitud de adopción para una mascota
 *     tags: [Adoptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdoptionRequest'
 *     responses:
 *       201:
 *         description: Solicitud de adopción creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Solicitud de adopción creada exitosamente"
 *                 adoption:
 *                   $ref: '#/components/schemas/Adoption'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Mascota no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', authenticateAndGetUser, async (req, res) => {
    try {
        const { petId, notes, adoptionFee } = req.body;

        // Verificar que la mascota existe
        const pet = await Pet.findById(petId);
        if (!pet) {
            return res.status(404).json({ error: 'Mascota no encontrada' });
        }

        // Verificar que la mascota está disponible para adopción
        if (pet.status !== 'available') {
            return res.status(400).json({ 
                error: 'La mascota no está disponible para adopción',
                details: `Estado actual: ${pet.status}`
            });
        }

        // Verificar que no existe una adopción pendiente para esta mascota
        const existingAdoption = await Adoption.findOne({
            petId,
            status: { $in: ['pending', 'approved'] }
        });

        if (existingAdoption) {
            return res.status(400).json({ 
                error: 'Ya existe una solicitud de adopción pendiente para esta mascota'
            });
        }

        const adoptionData = {
            petId,
            adopterId: req.user.id,
            adoptionDate: new Date(),
            status: 'pending',
            notes,
            adoptionFee: adoptionFee || 0
        };

        const adoption = new Adoption(adoptionData);
        await adoption.save();

        // Actualizar estado de la mascota
        pet.status = 'reserved';
        await pet.save();

        await adoption.populate('petId', 'name breed age');
        await adoption.populate('adopterId', 'firstName lastName email');

        res.status(201).json({
            message: 'Solicitud de adopción creada exitosamente',
            adoption
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/adoptions/{id}/approve:
 *   put:
 *     summary: Aprobar adopción
 *     description: Permite a un administrador aprobar una solicitud de adopción
 *     tags: [Adoptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la adopción
 *     responses:
 *       200:
 *         description: Adopción aprobada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Adopción aprobada exitosamente"
 *                 adoption:
 *                   $ref: '#/components/schemas/Adoption'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id/approve', authenticateAndGetUser, checkPermission('adoptions.update'), async (req, res) => {
    try {
        const adoption = await Adoption.findById(req.params.id)
            .populate('petId')
            .populate('adopterId');

        if (!adoption) {
            return res.status(404).json({ error: 'Adopción no encontrada' });
        }

        if (adoption.status !== 'pending') {
            return res.status(400).json({ 
                error: 'Solo se pueden aprobar adopciones pendientes',
                details: `Estado actual: ${adoption.status}`
            });
        }

        adoption.status = 'approved';
        adoption.approvedBy = req.user.id;
        adoption.approvedAt = new Date();
        await adoption.save();

        // Actualizar estado de la mascota
        const pet = await Pet.findById(adoption.petId._id);
        pet.status = 'adopted';
        await pet.save();

        res.json({
            message: 'Adopción aprobada exitosamente',
            adoption
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/adoptions/{id}/complete:
 *   put:
 *     summary: Completar adopción
 *     description: Marca una adopción como completada después del proceso de entrega
 *     tags: [Adoptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la adopción
 *     responses:
 *       200:
 *         description: Adopción completada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Adopción completada exitosamente"
 *                 adoption:
 *                   $ref: '#/components/schemas/Adoption'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id/complete', authenticateAndGetUser, checkPermission('adoptions.update'), async (req, res) => {
    try {
        const adoption = await Adoption.findById(req.params.id);

        if (!adoption) {
            return res.status(404).json({ error: 'Adopción no encontrada' });
        }

        if (adoption.status !== 'approved') {
            return res.status(400).json({ 
                error: 'Solo se pueden completar adopciones aprobadas',
                details: `Estado actual: ${adoption.status}`
            });
        }

        adoption.status = 'completed';
        adoption.completedAt = new Date();
        await adoption.save();

        await adoption.populate('petId', 'name breed age');
        await adoption.populate('adopterId', 'firstName lastName email');

        res.json({
            message: 'Adopción completada exitosamente',
            adoption
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/adoptions/{id}/cancel:
 *   put:
 *     summary: Cancelar adopción
 *     description: Cancela una adopción (solo el adoptante o un administrador)
 *     tags: [Adoptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la adopción
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Razón de la cancelación
 *                 example: "Cambio de circunstancias familiares"
 *     responses:
 *       200:
 *         description: Adopción cancelada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Adopción cancelada exitosamente"
 *                 adoption:
 *                   $ref: '#/components/schemas/Adoption'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id/cancel', authenticateAndGetUser, async (req, res) => {
    try {
        const adoption = await Adoption.findById(req.params.id);

        if (!adoption) {
            return res.status(404).json({ error: 'Adopción no encontrada' });
        }

        // Verificar permisos: solo el adoptante o un administrador puede cancelar
        if (adoption.adopterId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ 
                error: 'No tienes permisos para cancelar esta adopción'
            });
        }

        if (adoption.status === 'completed') {
            return res.status(400).json({ 
                error: 'No se puede cancelar una adopción ya completada'
            });
        }

        adoption.status = 'cancelled';
        adoption.cancelledAt = new Date();
        adoption.cancellationReason = req.body.reason || 'Cancelado por el usuario';
        await adoption.save();

        // Liberar la mascota si estaba reservada
        if (adoption.status === 'pending' || adoption.status === 'approved') {
            const pet = await Pet.findById(adoption.petId);
            pet.status = 'available';
            await pet.save();
        }

        await adoption.populate('petId', 'name breed age');
        await adoption.populate('adopterId', 'firstName lastName email');

        res.json({
            message: 'Adopción cancelada exitosamente',
            adoption
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/adoptions/{id}:
 *   delete:
 *     summary: Eliminar adopción
 *     description: Elimina permanentemente una adopción (solo administradores)
 *     tags: [Adoptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la adopción
 *     responses:
 *       204:
 *         description: Adopción eliminada exitosamente
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', authenticateAndGetUser, checkPermission('adoptions.delete'), async (req, res) => {
    try {
        const adoption = await Adoption.findById(req.params.id);

        if (!adoption) {
            return res.status(404).json({ error: 'Adopción no encontrada' });
        }

        // Liberar la mascota si estaba reservada
        if (adoption.status === 'pending' || adoption.status === 'approved') {
            const pet = await Pet.findById(adoption.petId);
            pet.status = 'available';
            await pet.save();
        }

        await Adoption.findByIdAndDelete(req.params.id);

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
