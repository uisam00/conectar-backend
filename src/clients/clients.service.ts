import {
  Injectable,
  ConflictException,
  UnprocessableEntityException,
  HttpStatus,
} from '@nestjs/common';
import { ClientRepository } from './infrastructure/persistence/client.repository';
import { Client } from './domain/client';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { QueryClientDto } from './dto/query-client.dto';
import { User } from '../users/domain/user';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { FilesService } from '../files/files.service';
import { FileType } from '../files/domain/file';

@Injectable()
export class ClientsService {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly filesService: FilesService,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    // Normalizar CNPJ (remover formatação)
    const normalizedCnpj = this.normalizeCnpj(createClientDto.cnpj);

    // Verificar se o CNPJ já existe
    const existingClient =
      await this.clientRepository.findByCnpj(normalizedCnpj);
    if (existingClient) {
      throw new ConflictException('CNPJ já cadastrado');
    }

    let photo: FileType | null | undefined = undefined;

    if (createClientDto.photo?.id) {
      const fileObject = await this.filesService.findById(
        createClientDto.photo.id,
      );
      if (!fileObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            photo: 'imageNotExists',
          },
        });
      }
      photo = fileObject;
    } else if (createClientDto.photo === null) {
      photo = null;
    }

    // Criar cliente com CNPJ normalizado e foto
    const clientData = {
      ...createClientDto,
      cnpj: normalizedCnpj,
      photo,
    };

    return this.clientRepository.create(clientData);
  }

  async findMany(
    queryDto: QueryClientDto,
  ): Promise<{ data: Client[]; total: number }> {
    return this.clientRepository.findMany(queryDto);
  }

  async findById(id: number): Promise<Client | null> {
    return this.clientRepository.findById(id);
  }

  async update(id: number, updateClientDto: UpdateClientDto): Promise<Client> {
    let photo: FileType | null | undefined = undefined;

    if (updateClientDto.photo?.id) {
      const fileObject = await this.filesService.findById(
        updateClientDto.photo.id,
      );
      if (!fileObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            photo: 'imageNotExists',
          },
        });
      }
      photo = fileObject;
    } else if (updateClientDto.photo === null) {
      photo = null;
    }

    // Se o CNPJ está sendo atualizado, verificar se já existe
    if (updateClientDto.cnpj) {
      const normalizedCnpj = this.normalizeCnpj(updateClientDto.cnpj);

      // Verificar se o CNPJ já existe em outro cliente
      const existingClient =
        await this.clientRepository.findByCnpj(normalizedCnpj);
      if (existingClient && existingClient.id !== id) {
        throw new ConflictException('CNPJ já cadastrado');
      }

      // Atualizar com CNPJ normalizado e foto
      const updateData = {
        ...updateClientDto,
        cnpj: normalizedCnpj,
        photo,
      };

      return this.clientRepository.update(id, updateData);
    }

    // Atualizar com foto
    const updateData = {
      ...updateClientDto,
      photo,
    };

    return this.clientRepository.update(id, updateData);
  }

  async delete(id: number): Promise<void> {
    return this.clientRepository.delete(id);
  }

  async findUsersByClient(
    clientId: number,
    {
      search,
      firstName,
      lastName,
      email,
      roleId,
      statusId,
      systemRoleId,
      clientRoleId,
      sortBy,
      sortOrder,
      paginationOptions,
    }: {
      search?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      roleId?: number;
      statusId?: number;
      systemRoleId?: number;
      clientRoleId?: number;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
      paginationOptions: IPaginationOptions;
    },
  ): Promise<User[]> {
    return this.clientRepository.findUsersByClient(clientId, {
      search,
      firstName,
      lastName,
      email,
      roleId,
      statusId,
      systemRoleId,
      clientRoleId,
      sortBy,
      sortOrder,
      paginationOptions,
    });
  }

  private normalizeCnpj(cnpj: string): string {
    // Remove todos os caracteres não numéricos
    return cnpj.replace(/\D/g, '');
  }
}
