import { PartialType } from '@nestjs/swagger';
import { CreateClientRoleDto } from './create-client-role.dto';

export class UpdateClientRoleDto extends PartialType(CreateClientRoleDto) {}
