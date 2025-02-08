import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm"

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  user_id: string

  @Column()
  wallet_address: string

  @CreateDateColumn()
  created_at: Date
}
