import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('tasks')
export class Task {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    creator_id: number

    @Column({ length: 144 })
    title: string

    @Column({ default: false })
    status?: boolean

    @Column()
    priority?: number

    @CreateDateColumn({ nullable: true, default: null })
    expriesAt: Date
}