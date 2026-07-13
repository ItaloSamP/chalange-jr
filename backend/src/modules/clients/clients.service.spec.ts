import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ClientStatus } from './enums/client-status.enum';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ListClientsQueryDto } from './dto/list-clients-query.dto';

// Mock the generated Prisma client to avoid ESM import.meta issues
jest.mock('../../../generated/prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({})),
}));

import { ClientsService } from './clients.service';
import { ClientsRepository } from './clients.repository';

describe('ClientsService', () => {
  let service: ClientsService;
  let repository: ClientsRepository;

  const mockClient = {
    id: 'client-uuid',
    nome: 'João Silva',
    email: 'joao@email.com',
    documento: '123.456.789-00',
    status: ClientStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockClientInactive = {
    ...mockClient,
    id: 'inactive-uuid',
    status: ClientStatus.INACTIVE,
  };

  const mockRepository = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findByDocumento: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    findMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        {
          provide: ClientsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
    repository = module.get<ClientsRepository>(ClientsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateClientDto = {
      nome: 'João Silva',
      email: 'joao@email.com',
      documento: '123.456.789-00',
    };

    it('should create client when email and documento are unique', async () => {
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.findByDocumento.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockClient);

      const result = await service.create(createDto);

      expect(result).toEqual(mockClient);
      expect(mockRepository.findByEmail).toHaveBeenCalledWith('joao@email.com');
      expect(mockRepository.findByDocumento).toHaveBeenCalledWith('123.456.789-00');
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
    });

    it('should throw ConflictException when email already exists', async () => {
      mockRepository.findByEmail.mockResolvedValue(mockClient);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      await expect(service.create(createDto)).rejects.toThrow('Email já cadastrado');
    });

    it('should throw ConflictException when documento already exists', async () => {
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.findByDocumento.mockResolvedValue(mockClient);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      await expect(service.create(createDto)).rejects.toThrow('Documento já cadastrado');
    });
  });

  describe('findAll', () => {
    it('should delegate to repository.findMany with query', async () => {
      const query: ListClientsQueryDto = { page: 1, limit: 10 };
      const expectedResult = { items: [mockClient], total: 1, page: 1, limit: 10 };
      mockRepository.findMany.mockResolvedValue(expectedResult);

      const result = await service.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(mockRepository.findMany).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return client when found', async () => {
      mockRepository.findById.mockResolvedValue(mockClient);

      const result = await service.findOne('client-uuid');

      expect(result).toEqual(mockClient);
      expect(mockRepository.findById).toHaveBeenCalledWith('client-uuid');
    });

    it('should throw NotFoundException when client not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('non-existent')).rejects.toThrow('Cliente não encontrado');
    });
  });

  describe('update', () => {
    const updateDto: UpdateClientDto = {
      nome: 'João Souza',
      email: 'joao.novo@email.com',
    };

    it('should update client when valid', async () => {
      mockRepository.findById.mockResolvedValue(mockClient);
      const updatedClient = { ...mockClient, nome: 'João Souza', email: 'joao.novo@email.com' };
      mockRepository.update.mockResolvedValue(updatedClient);
      mockRepository.findByEmail.mockResolvedValue(null);

      const result = await service.update('client-uuid', updateDto);

      expect(result).toEqual(updatedClient);
      expect(mockRepository.update).toHaveBeenCalledWith('client-uuid', updateDto);
    });

    it('should throw NotFoundException when client not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.update('non-existent', updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when client is INACTIVE', async () => {
      mockRepository.findById.mockResolvedValue(mockClientInactive);

      await expect(service.update('inactive-uuid', updateDto)).rejects.toThrow(ForbiddenException);
      await expect(service.update('inactive-uuid', updateDto)).rejects.toThrow(
        'Cliente inativo não pode ser editado',
      );
    });

    it('should throw ConflictException when email changed and already exists', async () => {
      mockRepository.findById.mockResolvedValue(mockClient);
      mockRepository.findByEmail.mockResolvedValue({ id: 'other-id', email: 'joao.novo@email.com' });

      await expect(service.update('client-uuid', updateDto)).rejects.toThrow(ConflictException);
      await expect(service.update('client-uuid', updateDto)).rejects.toThrow('Email já cadastrado');
    });

    it('should throw ConflictException when documento changed and already exists', async () => {
      mockRepository.findById.mockResolvedValue(mockClient);
      mockRepository.findByDocumento.mockResolvedValue({ id: 'other-id', documento: '999.999.999-99' });
      const dtoWithDocumento: UpdateClientDto = { documento: '999.999.999-99' };

      await expect(service.update('client-uuid', dtoWithDocumento)).rejects.toThrow(ConflictException);
      await expect(service.update('client-uuid', dtoWithDocumento)).rejects.toThrow('Documento já cadastrado');
    });

    it('should NOT check email uniqueness when email unchanged', async () => {
      mockRepository.findById.mockResolvedValue(mockClient);
      mockRepository.update.mockResolvedValue(mockClient);

      const sameEmailDto: UpdateClientDto = { email: 'joao@email.com' };

      await service.update('client-uuid', sameEmailDto);

      expect(mockRepository.findByEmail).not.toHaveBeenCalled();
    });

    it('should NOT check documento uniqueness when documento unchanged', async () => {
      mockRepository.findById.mockResolvedValue(mockClient);
      mockRepository.update.mockResolvedValue(mockClient);

      const sameDocDto: UpdateClientDto = { documento: '123.456.789-00' };

      await service.update('client-uuid', sameDocDto);

      expect(mockRepository.findByDocumento).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft delete client when ACTIVE', async () => {
      mockRepository.findById.mockResolvedValue(mockClient);
      mockRepository.softDelete.mockResolvedValue(mockClientInactive);

      const result = await service.remove('client-uuid');

      expect(result).toEqual(mockClientInactive);
      expect(mockRepository.softDelete).toHaveBeenCalledWith('client-uuid');
    });

    it('should throw NotFoundException when client not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
      await expect(service.remove('non-existent')).rejects.toThrow('Cliente não encontrado');
    });

    it('should throw NotFoundException when client already INACTIVE', async () => {
      mockRepository.findById.mockResolvedValue(mockClientInactive);

      await expect(service.remove('inactive-uuid')).rejects.toThrow(NotFoundException);
      await expect(service.remove('inactive-uuid')).rejects.toThrow('Cliente não encontrado');
    });
  });
});
