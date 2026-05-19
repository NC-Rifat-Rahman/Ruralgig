import { Injectable } from "@nestjs/common";

@Injectable()
export class UsersRepository {
    async findOne(username: string): Promise<User | undefined> {
        return "";
        // return this.users.find(user => user.username === username);
    }
}