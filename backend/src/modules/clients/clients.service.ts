import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientsRepository } from './clients.repository';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ListClientsQueryDto } from './dto/list-clients-query.dto';
import { ClientStatus } from './enums/client-status.enum';

@Injectable()
export class ClientsService {
  constructor(private readonly repository: ClientsRepository) {}

  async create(dto: CreateClientDto) {
    const existingEmail = await this.repository.findByEmail(dto.email);
    if (existingEmail) {
      throw new ConflictException('Email já cadastrado');
    }

    const existingDocumento = await this.repository.findByDocumento(dto.documento);
    if (existingDocumento) {
      throw new ConflictException('Documento já cadastrado');
    }

    return this.repository.create(dto);
  }

  async findAll(query: ListClientsQueryDto) {
    return this.repository.findMany(query);
  }

  async findOne(id: string) {
    const client = await this.repository.findById(id);
    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }
    return client;
  }

  async update(id: string, dto: UpdateClientDto) {
    const client = await this.findOne(id);

    if (client.status === ClientStatus.INACTIVE) {
      throw new ForbiddenException('Cliente inativo não pode ser editado');
    }

    if (dto.email && dto.email !== client.email) {
      const existingEmail = await this.repository.findByEmail(dto.email);
      if (existingEmail) {
        throw new ConflictException('Email já cadastrado');
      }
    }

    if (dto.documento && dto.documento !== client.documento) {
      const existingDocumento = await this.repository.findByDocumento(dto.documento);
      if (existingDocumento) {
        throw new ConflictException('Documento já cadastrado');
      }
    }

    return this.repository.update(id, dto);
  }

  async remove(id: string) {
    const client = await this.repository.findById(id);
    if (!client || client.status === ClientStatus.INACTIVE) {
      throw new NotFoundException('Cliente não encontrado');
    }
    return this.repository.softDelete(id);
  }
}