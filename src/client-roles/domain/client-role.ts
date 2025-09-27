import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';

export class ClientRole {
  @Allow()
  @ApiProperty({
    type: Number,
  })
  id: number | string;

  @Allow()
  @ApiProperty({
    type: String,
    example: 'client_admin',
  })
  name: string;

  @Allow()
  @ApiProperty({
    type: String,
    example: 'Administrador do cliente',
  })
  description?: string;

  @Allow()
  @ApiProperty({
    type: Object,
    example: {
      canManageUsers: true,
      canManageClient: true,
      canViewReports: true,
    },
  })
  permissions?: Record<string, any>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  deletedAt?: Date;
}
