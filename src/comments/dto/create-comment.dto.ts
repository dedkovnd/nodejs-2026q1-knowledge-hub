import { IsString, IsUUID, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string;

  @IsUUID(4)
  articleId: string;

  @IsOptional()
  @IsUUID(4)
  authorId?: string;
}
