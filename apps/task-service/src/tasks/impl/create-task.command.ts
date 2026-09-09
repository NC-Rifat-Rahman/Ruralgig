import { CreateTaskDto } from "../dto/create-task.dto";

export class CreateTaskCommand {
    constructor(
        public readonly businessId: number,
        public readonly dto: CreateTaskDto
    ) { }
}