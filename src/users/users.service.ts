import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { User } from './interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UsersService {
  private users: User[] = [];

  findAll(): Omit<User, 'password'>[] {
    return this.users.map(({ password, ...user }) => user);
  }

  findOne(id: string): Omit<User, 'password'> {
    this.validateId(id);
    const user = this.users.find(u => u.id === id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    const { password, ...result } = user;
    return result;
  }

  create(createUserDto: CreateUserDto): Omit<User, 'password'> {
    const newUser: User = {
      id: randomUUID(),
      login: createUserDto.login,
      password: createUserDto.password,
      role: createUserDto.role || 'viewer',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.users.push(newUser);
    const { password, ...result } = newUser;
    return result;
  }

  updatePassword(id: string, updatePasswordDto: UpdatePasswordDto): Omit<User, 'password'> {
    this.validateId(id);
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    
    const user = this.users[userIndex];
    if (user.password !== updatePasswordDto.oldPassword) {
      throw new ForbiddenException('Old password is wrong');
    }
    
    user.password = updatePasswordDto.newPassword;
    user.updatedAt = Date.now();
    this.users[userIndex] = user;
    
    const { password, ...result } = user;
    return result;
  }

  delete(id: string): void {
    this.validateId(id);
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    this.users.splice(userIndex, 1);
  }

  private validateId(id: string): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new BadRequestException('Invalid UUID format');
    }
  }
}
