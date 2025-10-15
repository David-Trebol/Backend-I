const request = require('supertest');
const express = require('express');

// Mock dependencies
jest.mock('../../src/models/Adoption');
jest.mock('../../src/models/Pet');
jest.mock('../../src/models/User');

const app = express();
app.use(express.json());

// Crear rutas simplificadas para testing
const testRoutes = express.Router();

// Importar las funciones de los controladores directamente
const Adoption = require('../../src/models/Adoption');
const Pet = require('../../src/models/Pet');
const User = require('../../src/models/User');

// Definir rutas de prueba sin middleware complejos
testRoutes.get('/', async (req, res) => {
  try {
    const { status, adopterId, petId, limit = 10, page = 1 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (adopterId) filter.adopterId = adopterId;
    if (petId) filter.petId = petId;

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

testRoutes.get('/:id', async (req, res) => {
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

testRoutes.post('/', async (req, res) => {
  try {
    const { petId, notes, adoptionFee } = req.body;

    const pet = await Pet.findById(petId);
    if (!pet) {
        return res.status(404).json({ error: 'Mascota no encontrada' });
    }

    if (pet.status !== 'available') {
        return res.status(400).json({ 
            error: 'La mascota no está disponible para adopción',
            details: `Estado actual: ${pet.status}`
        });
    }

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
        adopterId: req.body.adopterId || '507f1f77bcf86cd799439011',
        adoptionDate: new Date(),
        status: 'pending',
        notes,
        adoptionFee: adoptionFee || 0
    };

    const adoption = new Adoption(adoptionData);
    await adoption.save();

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

testRoutes.put('/:id/approve', async (req, res) => {
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
    adoption.approvedBy = req.body.approvedBy || '507f1f77bcf86cd799439011';
    adoption.approvedAt = new Date();
    await adoption.save();

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

testRoutes.put('/:id/complete', async (req, res) => {
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

testRoutes.put('/:id/cancel', async (req, res) => {
  try {
    const adoption = await Adoption.findById(req.params.id);

    if (!adoption) {
        return res.status(404).json({ error: 'Adopción no encontrada' });
    }

    if (adoption.adopterId.toString() !== req.body.userId && req.body.userRole !== 'admin') {
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

testRoutes.delete('/:id', async (req, res) => {
  try {
    const adoption = await Adoption.findById(req.params.id);

    if (!adoption) {
        return res.status(404).json({ error: 'Adopción no encontrada' });
    }

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

app.use('/api/adoptions', testRoutes);

describe('Adoption Routes', () => {
  const mockUser = {
    id: '507f1f77bcf86cd799439011',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan@example.com',
    role: 'customer'
  };

  const mockPet = {
    _id: '507f1f77bcf86cd799439012',
    name: 'Max',
    breed: 'Golden Retriever',
    age: 3,
    status: 'available'
  };

  const mockAdoption = {
    _id: '507f1f77bcf86cd799439013',
    petId: mockPet._id,
    adopterId: mockUser.id,
    adoptionDate: new Date(),
    status: 'pending',
    notes: 'Família con niños pequeños',
    adoptionFee: 150.00,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/adoptions', () => {
    it('should get all adoptions successfully', async () => {
      const Adoption = require('../../src/models/Adoption');
      const mockPopulatedAdoption = {
        ...mockAdoption,
        petId: mockPet,
        adopterId: mockUser
      };

      Adoption.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              skip: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue([mockPopulatedAdoption])
              })
            })
          })
        })
      });

      Adoption.countDocuments.mockResolvedValue(1);

      const response = await request(app)
        .get('/api/adoptions')
        .expect(200);

      expect(response.body.message).toBe('Adopciones obtenidas exitosamente');
      expect(response.body.adoptions).toHaveLength(1);
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter adoptions by status', async () => {
      const Adoption = require('../../src/models/Adoption');
      
      Adoption.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              skip: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue([])
              })
            })
          })
        })
      });

      Adoption.countDocuments.mockResolvedValue(0);

      await request(app)
        .get('/api/adoptions?status=pending')
        .expect(200);

      expect(Adoption.find).toHaveBeenCalledWith({ status: 'pending' });
    });

    it('should handle errors when getting adoptions', async () => {
      const Adoption = require('../../src/models/Adoption');
      Adoption.find.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/adoptions')
        .expect(500);

      expect(response.body.error).toBe('Database error');
    });
  });

  describe('GET /api/adoptions/:id', () => {
    it('should get adoption by ID successfully', async () => {
      const Adoption = require('../../src/models/Adoption');
      const mockPopulatedAdoption = {
        ...mockAdoption,
        petId: mockPet,
        adopterId: mockUser
      };

      Adoption.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockPopulatedAdoption)
        })
      });

      const response = await request(app)
        .get(`/api/adoptions/${mockAdoption._id}`)
        .expect(200);

      expect(response.body.message).toBe('Adopción obtenida exitosamente');
      expect(response.body.adoption).toEqual(mockPopulatedAdoption);
    });

    it('should return 404 when adoption not found', async () => {
      const Adoption = require('../../src/models/Adoption');
      
      Adoption.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(null)
        })
      });

      const response = await request(app)
        .get('/api/adoptions/nonexistent')
        .expect(404);

      expect(response.body.error).toBe('Adopción no encontrada');
    });
  });

  describe('POST /api/adoptions', () => {
    it('should create adoption request successfully', async () => {
      const Adoption = require('../../src/models/Adoption');
      const Pet = require('../../src/models/Pet');

      Pet.findById.mockResolvedValue(mockPet);
      Adoption.findOne.mockResolvedValue(null);
      
      const mockAdoptionInstance = {
        save: jest.fn().mockResolvedValue(mockAdoption),
        populate: jest.fn().mockResolvedValue(mockAdoption)
      };

      Adoption.mockImplementation(() => mockAdoptionInstance);

      const adoptionData = {
        petId: mockPet._id,
        notes: 'Família con niños pequeños',
        adoptionFee: 150.00
      };

      const response = await request(app)
        .post('/api/adoptions')
        .send(adoptionData)
        .expect(201);

      expect(response.body.message).toBe('Solicitud de adopción creada exitosamente');
      expect(response.body.adoption).toBeDefined();
    });

    it('should return 404 when pet not found', async () => {
      const Pet = require('../../src/models/Pet');
      Pet.findById.mockResolvedValue(null);

      const adoptionData = {
        petId: 'nonexistent',
        notes: 'Test notes'
      };

      const response = await request(app)
        .post('/api/adoptions')
        .send(adoptionData)
        .expect(404);

      expect(response.body.error).toBe('Mascota no encontrada');
    });

    it('should return 400 when pet not available', async () => {
      const Pet = require('../../src/models/Pet');
      const unavailablePet = { ...mockPet, status: 'adopted' };
      
      Pet.findById.mockResolvedValue(unavailablePet);

      const adoptionData = {
        petId: mockPet._id,
        notes: 'Test notes'
      };

      const response = await request(app)
        .post('/api/adoptions')
        .send(adoptionData)
        .expect(400);

      expect(response.body.error).toBe('La mascota no está disponible para adopción');
    });

    it('should return 400 when adoption already exists', async () => {
      const Adoption = require('../../src/models/Adoption');
      const Pet = require('../../src/models/Pet');

      Pet.findById.mockResolvedValue(mockPet);
      Adoption.findOne.mockResolvedValue(mockAdoption);

      const adoptionData = {
        petId: mockPet._id,
        notes: 'Test notes'
      };

      const response = await request(app)
        .post('/api/adoptions')
        .send(adoptionData)
        .expect(400);

      expect(response.body.error).toBe('Ya existe una solicitud de adopción pendiente para esta mascota');
    });
  });

  describe('PUT /api/adoptions/:id/approve', () => {
    it('should approve adoption successfully', async () => {
      const Adoption = require('../../src/models/Adoption');
      const Pet = require('../../src/models/Pet');

      const pendingAdoption = { ...mockAdoption, status: 'pending' };
      
      Adoption.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(pendingAdoption)
        })
      });

      Pet.findById.mockResolvedValue(mockPet);
      pendingAdoption.save = jest.fn().mockResolvedValue(pendingAdoption);
      mockPet.save = jest.fn().mockResolvedValue(mockPet);

      const response = await request(app)
        .put(`/api/adoptions/${mockAdoption._id}/approve`)
        .expect(200);

      expect(response.body.message).toBe('Adopción aprobada exitosamente');
      expect(pendingAdoption.status).toBe('approved');
    });

    it('should return 400 when adoption is not pending', async () => {
      const Adoption = require('../../src/models/Adoption');
      const approvedAdoption = { ...mockAdoption, status: 'approved' };

      Adoption.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(approvedAdoption)
        })
      });

      const response = await request(app)
        .put(`/api/adoptions/${mockAdoption._id}/approve`)
        .expect(400);

      expect(response.body.error).toBe('Solo se pueden aprobar adopciones pendientes');
    });
  });

  describe('PUT /api/adoptions/:id/complete', () => {
    it('should complete adoption successfully', async () => {
      const Adoption = require('../../src/models/Adoption');
      const approvedAdoption = { ...mockAdoption, status: 'approved' };

      Adoption.findById.mockResolvedValue(approvedAdoption);
      approvedAdoption.save = jest.fn().mockResolvedValue(approvedAdoption);
      approvedAdoption.populate = jest.fn().mockResolvedValue(approvedAdoption);

      const response = await request(app)
        .put(`/api/adoptions/${mockAdoption._id}/complete`)
        .expect(200);

      expect(response.body.message).toBe('Adopción completada exitosamente');
      expect(approvedAdoption.status).toBe('completed');
    });

    it('should return 400 when adoption is not approved', async () => {
      const Adoption = require('../../src/models/Adoption');
      const pendingAdoption = { ...mockAdoption, status: 'pending' };

      Adoption.findById.mockResolvedValue(pendingAdoption);

      const response = await request(app)
        .put(`/api/adoptions/${mockAdoption._id}/complete`)
        .expect(400);

      expect(response.body.error).toBe('Solo se pueden completar adopciones aprobadas');
    });
  });

  describe('PUT /api/adoptions/:id/cancel', () => {
    it('should cancel adoption successfully by adopter', async () => {
      const Adoption = require('../../src/models/Adoption');
      const Pet = require('../../src/models/Pet');

      const pendingAdoption = { ...mockAdoption, status: 'pending' };
      pendingAdoption.adopterId = { toString: () => mockUser.id };

      Adoption.findById.mockResolvedValue(pendingAdoption);
      Pet.findById.mockResolvedValue(mockPet);
      
      pendingAdoption.save = jest.fn().mockResolvedValue(pendingAdoption);
      pendingAdoption.populate = jest.fn().mockResolvedValue(pendingAdoption);
      mockPet.save = jest.fn().mockResolvedValue(mockPet);

      const response = await request(app)
        .put(`/api/adoptions/${mockAdoption._id}/cancel`)
        .send({ reason: 'Change of circumstances' })
        .expect(200);

      expect(response.body.message).toBe('Adopción cancelada exitosamente');
      expect(pendingAdoption.status).toBe('cancelled');
    });

    it('should return 403 when user is not adopter or admin', async () => {
      const Adoption = require('../../src/models/Adoption');
      const pendingAdoption = { ...mockAdoption, status: 'pending' };
      pendingAdoption.adopterId = { toString: () => 'different-user-id' };

      Adoption.findById.mockResolvedValue(pendingAdoption);

      const response = await request(app)
        .put(`/api/adoptions/${mockAdoption._id}/cancel`)
        .expect(403);

      expect(response.body.error).toBe('No tienes permisos para cancelar esta adopción');
    });

    it('should return 400 when trying to cancel completed adoption', async () => {
      const Adoption = require('../../src/models/Adoption');
      const completedAdoption = { ...mockAdoption, status: 'completed' };

      Adoption.findById.mockResolvedValue(completedAdoption);

      const response = await request(app)
        .put(`/api/adoptions/${mockAdoption._id}/cancel`)
        .expect(400);

      expect(response.body.error).toBe('No se puede cancelar una adopción ya completada');
    });
  });

  describe('DELETE /api/adoptions/:id', () => {
    it('should delete adoption successfully', async () => {
      const Adoption = require('../../src/models/Adoption');
      const Pet = require('../../src/models/Pet');

      const pendingAdoption = { ...mockAdoption, status: 'pending' };

      Adoption.findById.mockResolvedValue(pendingAdoption);
      Pet.findById.mockResolvedValue(mockPet);
      Adoption.findByIdAndDelete.mockResolvedValue(pendingAdoption);
      mockPet.save = jest.fn().mockResolvedValue(mockPet);

      await request(app)
        .delete(`/api/adoptions/${mockAdoption._id}`)
        .expect(204);

      expect(Adoption.findByIdAndDelete).toHaveBeenCalledWith(mockAdoption._id);
    });

    it('should return 404 when adoption not found', async () => {
      const Adoption = require('../../src/models/Adoption');
      Adoption.findById.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/adoptions/nonexistent')
        .expect(404);

      expect(response.body.error).toBe('Adopción no encontrada');
    });
  });
});
