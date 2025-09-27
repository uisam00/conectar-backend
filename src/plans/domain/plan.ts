import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';

export class Plan {
  @Allow()
  @ApiProperty({
    type: Number,
  })
  id: number | string;

  @Allow()
  @ApiProperty({
    type: String,
    example: 'Plano Básico',
  })
  name: string;

  @Allow()
  @ApiProperty({
    type: String,
    example: 'Plano ideal para pequenas empresas',
  })
  description?: string;

  @Allow()
  @ApiProperty({
    type: Number,
    example: 99.9,
  })
  price?: number;

  @Allow()
  @ApiProperty({
    type: Boolean,
    example: false,
    description: 'Indica se é um plano especial',
  })
  isSpecial?: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  deletedAt?: Date;
}
