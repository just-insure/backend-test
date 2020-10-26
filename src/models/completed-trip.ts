import {
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  PrimaryColumn,
  Entity,
} from "typeorm";

@Entity()
export class CompletedTrip extends BaseEntity {
  @PrimaryColumn()
  id!: string;

  @Column({ nullable: false })
  userId!: number;

  @Column({ nullable: true })
  start!: Date;

  @Column({ nullable: true })
  end!: Date;

  @Column({ type: "float" })
  distance!: number;

  @Column()
  duration!: string;

  @Column()
  tripDataUrl!: string;

  @Column()
  tripRawDataUrl!: string;

  @Column({ nullable: true })
  transactionId!: number;

  @Column({ nullable: true })
  cost!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
