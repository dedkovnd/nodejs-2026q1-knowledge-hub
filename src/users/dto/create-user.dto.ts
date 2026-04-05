import { IsString, IsIn, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'john_doe' })
  @IsString()
  login: string;

  @ApiProperty({ example: 'securePass123' })
  @IsString()
  password: string;

  @ApiProperty({ enum: ['admin', 'editor', 'viewer'], default: 'viewer' })
  @IsOptional()
  @IsIn(['admin', 'editor', 'viewer'])
  role?: 'admin' | 'editor' | 'viewer';
}
