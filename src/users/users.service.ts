import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { NullableType } from '../utils/types/nullable.type';
import { UserRepository } from './infrastructure/persistence/user.repository';
import { User } from './domain/user';
import bcrypt from 'bcryptjs';
import { AuthProvidersEnum } from '../auth/auth-providers.enum';
import { FilesService } from '../files/files.service';
import { RoleEnum } from '../roles/roles.enum';
import { StatusEnum } from '../statuses/statuses.enum';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { FileType } from '../files/domain/file';
import { Role } from '../roles/domain/role';
import { Status } from '../statuses/domain/status';
import { UpdateUserDto } from './dto/update-user.dto';
import { ClientRepository } from '../clients/infrastructure/persistence/client.repository';
import { MailService } from '../mail/mail.service';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '../config/config.type';
import { UpdateUserPayload } from './infrastructure/persistence/user.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UserRepository,
    private readonly filesService: FilesService,
    private readonly clientRepository: ClientRepository,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  async create(
    createUserDto: CreateUserDto,
    options?: {
      sendPasswordEmail?: boolean;
      sendConfirmEmail?: boolean;
      sendWelcomeEmail?: boolean;
    },
  ): Promise<User> {
    // Do not remove comment below.
    // <creating-property />

    // Gerar senha temporária se não for fornecida
    const temporaryPassword = createUserDto.password || randomStringGenerator();
    const salt = await bcrypt.genSalt();
    const password = await bcrypt.hash(temporaryPassword, salt);

    let email: string | null = null;

    if (createUserDto.email) {
      const userObject = await this.usersRepository.findByEmail(
        createUserDto.email,
      );
      if (userObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: 'emailAlreadyExists',
          },
        });
      }
      email = createUserDto.email;
    }

    let photo: FileType | null | undefined = undefined;

    if (createUserDto.photo?.id) {
      const fileObject = await this.filesService.findById(
        createUserDto.photo.id,
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
    } else if (createUserDto.photo === null) {
      photo = null;
    }

    let role: Role | undefined = undefined;

    if (createUserDto.role?.id) {
      const roleObject = Object.values(RoleEnum)
        .map(String)
        .includes(String(createUserDto.role.id));
      if (!roleObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            role: 'roleNotExists',
          },
        });
      }

      role = {
        id: createUserDto.role.id,
      };
    }

    let status: Status | undefined = undefined;

    if (createUserDto.status?.id) {
      const statusObject = Object.values(StatusEnum)
        .map(String)
        .includes(String(createUserDto.status.id));
      if (!statusObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            status: 'statusNotExists',
          },
        });
      }

      status = {
        id: createUserDto.status.id,
      };
    }

    // Verificar clientes e roles antes de criar o usuário
    const clientAssociations =
      await this.prepareClientAssociations(createUserDto);

    const user = await this.usersRepository.create({
      // Do not remove comment below.
      // <creating-property-payload />
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      email: email,
      password: password,
      photo: photo,
      role: role,
      status: status,
      provider: createUserDto.provider ?? AuthProvidersEnum.email,
      socialId: createUserDto.socialId,
      clientAssociations, // Incluir associações diretamente
    });

    if (email && createUserDto.firstName) {
      if (options?.sendConfirmEmail) {
        const hash = await this.jwtService.signAsync(
          { confirmEmailUserId: user.id },
          {
            secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
              infer: true,
            }),
            expiresIn: this.configService.getOrThrow(
              'auth.confirmEmailExpires',
              {
                infer: true,
              },
            ),
          },
        );

        if (options?.sendPasswordEmail) {
          // confirmação + senha temporária
          await this.mailService.userCreatedWithConfirmation({
            to: email,
            data: {
              firstName: createUserDto.firstName,
              temporaryPassword: temporaryPassword,
              hash,
            },
          });
        } else {
          // somente confirmação
          await this.mailService.userSignUp({
            to: email,
            data: { hash },
          });
        }
      } else if (options?.sendPasswordEmail) {
        // Apenas senha temporária (sem confirmação)
        await this.mailService.userCreated({
          to: email,
          data: {
            firstName: createUserDto.firstName,
            temporaryPassword: temporaryPassword,
          },
        });
      } else if (options?.sendWelcomeEmail) {
        // Mensagem de boas-vindas (sem senha temporária)
        await this.mailService.userCreated({
          to: email,
          data: {
            firstName: createUserDto.firstName,
          },
        });
      }
    }

    return user;
  }

  findManyWithPagination({
    search,
    firstName,
    lastName,
    email,
    roleId,
    statusId,
    clientId,
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
    clientId?: number;
    systemRoleId?: number;
    clientRoleId?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    paginationOptions: IPaginationOptions;
  }): Promise<User[]> {
    return this.usersRepository.findManyWithPagination({
      search,
      firstName,
      lastName,
      email,
      roleId,
      statusId,
      clientId,
      systemRoleId,
      clientRoleId,
      sortBy,
      sortOrder,
      paginationOptions,
    });
  }

  async findMany(filters: {
    search?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    roleId?: number;
    statusId?: number;
    clientId?: number;
    systemRoleId?: number;
    clientRoleId?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<{ data: User[]; total: number }> {
    const page = filters.page ?? 1;
    let limit = filters.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return await this.usersRepository.findMany({
      search: filters.search,
      firstName: filters.firstName,
      lastName: filters.lastName,
      email: filters.email,
      roleId: filters.roleId,
      statusId: filters.statusId,
      clientId: filters.clientId,
      systemRoleId: filters.systemRoleId,
      clientRoleId: filters.clientRoleId,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      page,
      limit,
    });
  }

  findById(id: User['id']): Promise<NullableType<User>> {
    return this.usersRepository.findById(id);
  }

  findByIds(ids: User['id'][]): Promise<User[]> {
    return this.usersRepository.findByIds(ids);
  }

  findByEmail(email: User['email']): Promise<NullableType<User>> {
    return this.usersRepository.findByEmail(email);
  }

  findBySocialIdAndProvider({
    socialId,
    provider,
  }: {
    socialId: User['socialId'];
    provider: User['provider'];
  }): Promise<NullableType<User>> {
    return this.usersRepository.findBySocialIdAndProvider({
      socialId,
      provider,
    });
  }

  async update(
    id: User['id'],
    updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
    // Do not remove comment below.
    // <updating-property />

    let password: string | undefined = undefined;

    if (updateUserDto.password) {
      const userObject = await this.usersRepository.findById(id);

      if (userObject && userObject?.password !== updateUserDto.password) {
        const salt = await bcrypt.genSalt();
        password = await bcrypt.hash(updateUserDto.password, salt);
      }
    }

    let email: string | null | undefined = undefined;

    if (updateUserDto.email) {
      const userObject = await this.usersRepository.findByEmail(
        updateUserDto.email,
      );

      if (userObject && Number(userObject.id) !== Number(id)) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: 'emailAlreadyExists',
          },
        });
      }

      email = updateUserDto.email;
    } else if (updateUserDto.email === null) {
      email = null;
    }

    let photo: FileType | null | undefined = undefined;

    if (updateUserDto.photo?.id) {
      const fileObject = await this.filesService.findById(
        updateUserDto.photo.id,
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
    } else if (updateUserDto.photo === null) {
      photo = null;
    }

    let role: Role | undefined = undefined;

    if (updateUserDto.role?.id) {
      const roleObject = Object.values(RoleEnum)
        .map(String)
        .includes(String(updateUserDto.role.id));
      if (!roleObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            role: 'roleNotExists',
          },
        });
      }

      role = {
        id: updateUserDto.role.id,
      };
    }

    let status: Status | undefined = undefined;

    if (updateUserDto.status?.id) {
      const statusObject = Object.values(StatusEnum)
        .map(String)
        .includes(String(updateUserDto.status.id));
      if (!statusObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            status: 'statusNotExists',
          },
        });
      }

      status = {
        id: updateUserDto.status.id,
      };
    }

    // Mapear clientRoles diretamente para clientAssociations (sem validação prévia)
    const clientAssociations = Array.isArray((updateUserDto as any).clientRoles)
      ? (updateUserDto as any).clientRoles.map((r) => ({
          clientId: r.clientId,
          clientRoleId: r.clientRoleId,
        }))
      : undefined;

    const updatePayload: UpdateUserPayload = {
      // Do not remove comment below.
      // <updating-property-payload />
      firstName: updateUserDto.firstName,
      lastName: updateUserDto.lastName,
      email,
      password,
      photo,
      role,
      status,
      provider: updateUserDto.provider,
      socialId: updateUserDto.socialId,
      clientAssociations,
    };

    return this.usersRepository.update(id, updatePayload);
  }

  async remove(id: User['id']): Promise<void> {
    await this.usersRepository.remove(id);
  }

  async findMyClients(userId: number) {
    const clients = await this.clientRepository.findByUserId(userId);
    return {
      clients,
      userRole: null, // Simplificado por enquanto
    };
  }

  private async prepareClientAssociations(
    userDto: CreateUserDto | UpdateUserDto,
  ): Promise<{ clientId: number; clientRoleId?: number }[]> {
    const associations: { clientId: number; clientRoleId?: number }[] = [];

    // Processar clientRoles (com roles específicas)
    if (userDto.clientRoles && userDto.clientRoles.length > 0) {
      for (const { clientId, clientRoleId } of userDto.clientRoles) {
        const client = await this.clientRepository.findById(clientId);
        if (!client) {
          throw new UnprocessableEntityException({
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            errors: {
              clientRoles: `Cliente com ID ${clientId} não encontrado`,
            },
          });
        }
        associations.push({ clientId, clientRoleId });
      }
    }

    return associations;
  }
}
