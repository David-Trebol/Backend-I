const UserDTO = require('../../src/dtos/UserDTO');

describe('UserDTO', () => {
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan@example.com',
    age: 25,
    role: 'customer',
    status: 'active',
    password: 'hashedPassword',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockTokenData = {
    id: '507f1f77bcf86cd799439011',
    email: 'juan@example.com',
    role: 'customer'
  };

  describe('toProfile', () => {
    it('should create profile DTO without sensitive data', () => {
      const profileDTO = UserDTO.toProfile(mockUser);
      
      expect(profileDTO).toBeDefined();
      expect(profileDTO.id).toBe(mockUser._id);
      expect(profileDTO.firstName).toBe(mockUser.firstName);
      expect(profileDTO.lastName).toBe(mockUser.lastName);
      expect(profileDTO.email).toBe(mockUser.email);
      expect(profileDTO.age).toBe(mockUser.age);
      expect(profileDTO.role).toBe(mockUser.role);
      expect(profileDTO.status).toBe(mockUser.status);
      expect(profileDTO.password).toBeUndefined();
    });

    it('should handle user without all fields', () => {
      const incompleteUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com'
      };
      
      const profileDTO = UserDTO.toProfile(incompleteUser);
      
      expect(profileDTO).toBeDefined();
      expect(profileDTO.id).toBe(incompleteUser._id);
      expect(profileDTO.email).toBe(incompleteUser.email);
    });
  });

  describe('toAuth', () => {
    it('should create auth DTO with basic info', () => {
      const authDTO = UserDTO.toAuth(mockUser);
      
      expect(authDTO).toBeDefined();
      expect(authDTO.id).toBe(mockUser._id);
      expect(authDTO.email).toBe(mockUser.email);
      expect(authDTO.role).toBe(mockUser.role);
      expect(authDTO.password).toBeUndefined();
      expect(authDTO.firstName).toBeUndefined();
    });
  });

  describe('toBasic', () => {
    it('should create basic DTO with minimal info', () => {
      const basicDTO = UserDTO.toBasic(mockUser);
      
      expect(basicDTO).toBeDefined();
      expect(basicDTO.id).toBe(mockUser._id);
      expect(basicDTO.email).toBe(mockUser.email);
      expect(basicDTO.role).toBe(mockUser.role);
      expect(basicDTO.password).toBeUndefined();
      expect(basicDTO.firstName).toBeUndefined();
      expect(basicDTO.age).toBeUndefined();
    });
  });

  describe('fromToken', () => {
    it('should create DTO from token data', () => {
      const tokenDTO = UserDTO.fromToken(mockTokenData);
      
      expect(tokenDTO).toBeDefined();
      expect(tokenDTO.id).toBe(mockTokenData.id);
      expect(tokenDTO.email).toBe(mockTokenData.email);
      expect(tokenDTO.role).toBe(mockTokenData.role);
      expect(tokenDTO.password).toBeUndefined();
    });

    it('should handle token data without all fields', () => {
      const incompleteToken = {
        id: '507f1f77bcf86cd799439011'
      };
      
      const tokenDTO = UserDTO.fromToken(incompleteToken);
      
      expect(tokenDTO).toBeDefined();
      expect(tokenDTO.id).toBe(incompleteToken.id);
      expect(tokenDTO.email).toBeUndefined();
    });
  });
});
