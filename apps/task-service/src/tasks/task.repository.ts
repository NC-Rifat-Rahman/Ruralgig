import { Injectable } from "@nestjs/common";
import { TaskEntity } from "./entity/task.entity";
import { Repository } from "typeorm/browser/repository/Repository.js";
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TaskRepository {
    constructor(
        @InjectRepository(TaskEntity) private readonly repo: Repository<TaskEntity>
    ) { }

    async save(task: TaskEntity): Promise<TaskEntity> {
        return this.repo.save(task);
    }
}
