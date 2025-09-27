import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { UserEntity } from './user.entity';
import { ClientEntity } from '../../../../../clients/infrastructure/persistence/relational/entities/client.entity';
import { ClientRoleEntity } from '../../../../../client-roles/infrastructure/persistence/relational/entities/client-role.entity';

@Entity({
  name: 'user_clients',
})
export class UserClientEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'int' })
  clientId: number;

  @Column({ type: 'int', nullable: true })
  clientRoleId?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToOne(() => ClientEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clientId' })
  client: ClientEntity;

  @ManyToOne(() => ClientRoleEntity, { nullable: true })
  @JoinColumn({ name: 'clientRoleId' })
  clientRole?: ClientRoleEntity;
}
