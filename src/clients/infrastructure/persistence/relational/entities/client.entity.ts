import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { StatusEntity } from '../../../../../statuses/infrastructure/persistence/relational/entities/status.entity';
import { PlanEntity } from '../../../../../plans/infrastructure/persistence/relational/entities/plan.entity';
import { FileEntity } from '../../../../../files/infrastructure/persistence/relational/entities/file.entity';

@Entity({
  name: 'clients',
})
export class ClientEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  razaoSocial: string;

  @Index()
  @Column({ type: 'varchar', length: 18, unique: true })
  cnpj: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nomeComercial?: string;

  @ManyToOne(() => StatusEntity, {
    eager: true,
  })
  @JoinColumn({ name: 'statusId' })
  status?: StatusEntity;

  @Column({ type: 'int' })
  statusId: number;

  @ManyToOne(() => PlanEntity, {
    eager: true,
  })
  @JoinColumn({ name: 'planId' })
  plan?: PlanEntity;

  @Column({ type: 'int' })
  planId: number;

  @ManyToOne(() => FileEntity, {
    eager: true,
  })
  @JoinColumn({ name: 'photoId' })
  photo?: FileEntity | null;

  @Column({ type: 'uuid', nullable: true })
  photoId?: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
