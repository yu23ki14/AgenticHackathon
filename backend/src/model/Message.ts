import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id!: number

  // Telegram の group_id を文字列として保存
  @Column()
  group_id!: string

  // ユーザーID（user_id）
  @Column()
  user_id!: string

  // メッセージ本文
  @Column({ type: "text" })
  text!: string

  // メッセージ送信日時
  @Column({ type: "datetime" })
  created_at!: Date
}
