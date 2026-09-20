import { Module } from "@nestjs/common";
import { TaskRepository } from "./task.repository";
import { TaskService } from "./task.service";
import { TaskEntity } from "./entity/task.entity";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [TypeOrmModule.forFeature([TaskEntity]),],
    providers: [TaskService, TaskRepository],
    exports: [TaskService]
})

export class TaskModule { }