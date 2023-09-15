import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PaymentStatus } from '../shared/payment-status.enum';

@Entity('payment')
export class PaymentEntity {
  @PrimaryGeneratedColumn('increment', {
    type: 'bigint',
  })
  id: number;

  @Column({
    name: 'order_id',
    type: 'bigint',
    nullable: false,
  })
  orderId: number;

  @Column({
    name: 'user_id',
    type: 'bigint',
    nullable: false,
  })
  userId: number;

  @Column({
    name: 'transaction_id',
    type: 'varchar',
    nullable: false,
    unique: true,
    length: 50,
  })
  transactionId: string;

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
    enum: Object.values(PaymentStatus),
    nullable: false,
  })
  status: PaymentStatus;

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
