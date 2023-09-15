import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { OrderStatus } from '../shared/order-status.enum';

@Entity('order')
export class OrderEntity {
  @PrimaryGeneratedColumn('increment', {
    type: 'bigint',
  })
  id: number;

  @Column({
    name: 'amount',
    type: 'double',
    nullable: false,
    default: 0,
  })
  amount: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: Object.values(OrderStatus),
    nullable: false,
    default: OrderStatus.Created,
  })
  status: OrderStatus;

  @Column({
    name: 'user_id',
    type: 'bigint',
    nullable: false,
  })
  userId: number;

  @Column({
    name: 'transaction_id',
    type: 'varchar',
    nullable: true,
    length: 50,
  })
  transactionId: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'datetime',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'datetime',
  })
  updatedAt: Date;
}
