import { PostFullInfo } from './post-include.type';
import { CommentForView } from '../comments.repository';

export type FeedFullInfo = PostFullInfo & {
  comments: CommentForView[];
  isLikedByCurrentUser: boolean;
};
