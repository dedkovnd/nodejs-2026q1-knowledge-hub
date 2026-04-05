import { Module, forwardRef } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ArticlesModule } from '../articles/articles.module';
import { CommentsModule } from '../comments/comments.module';

@Module({
  imports: [forwardRef(() => ArticlesModule), forwardRef(() => CommentsModule)],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
