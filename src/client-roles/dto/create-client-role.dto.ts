import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsNotEmpty } from 'class-validator';

export class CreateClientRoleDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    example: 'client_admin',
  })
  name: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    example: 'Administrador do cliente',
    required: false,
  })
  description?: string;

  @IsOptional()
  @IsObject()
  @ApiProperty({
    type: Object,
    example: {
      canManageUsers: true,
      canManageClient: true,
      canViewReports: true,
    },
    required: false,
  })
  permissions?: Record<string, any>;
}
