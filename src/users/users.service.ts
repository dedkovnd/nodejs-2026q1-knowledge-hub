import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { User } from './interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ArticlesService } from '../articles/articles.service';
import { CommentsService } from '../comments/comments.service';

@Injectable()
export class UsersService {
  private users: User[] = [];

  constructor(
    @Inject(forwardRef(() => ArticlesService))
    private readonly articlesService: ArticlesService,
    @Inject(forwardRef(() => CommentsService))
    private readonly commentsService: CommentsService,
  ) {}

  findAll(): Omit<User, 'password'>[] {
    return this.users.map(({ password, ...user }) => user);
  }

  findOne(id: string): Omit<User, 'password'> {
    this.validateUuid(id);
    const user = this.users.find(u => u.id === id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    const { password, ...result } = user;
    return result;
  }

  findOneWithPassword(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  create(createUserDto: CreateUserDto): Omit<User, 'password'> {
    const existingUser = this.users.find(u => u.login === createUserDto.login);
    if (existingUser) {
      throw new BadRequestException('User with this login already exists');
    }

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
    this.validateUuid(id);
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
    this.validateUuid(id);
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    
    this.articlesService.onUserDelete(id);
    this.commentsService.onUserDelete(id);
    
    this.users.splice(userIndex, 1);
  }

  private validateUuid(id: string): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new BadRequestException('Invalid UUID format');
    }
  }
}
