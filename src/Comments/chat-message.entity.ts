// import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
// import { User } from "../users/user.entity";
// import { Magazine } from "../magazines/magazine.entity";

// @Entity()
// export class ChatMessage {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @ManyToOne(() => Magazine, (magazine) => magazine.messages, { onDelete: "CASCADE" })
//   magazine: Magazine;

//   @ManyToOne(() => User, (user) => user.messages, { onDelete: "CASCADE" })
//   user: User;

//   @Column("text")
//   message: string;

//   @CreateDateColumn()
//   createdAt: Date;
// }
