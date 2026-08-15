
export class UserPostViewDto {
  id!: number;

  userId!: number;
  userName!: string;

  avatar?: string;

  description!: string | null;

  createdAt!: Date;

  images!: {
    url: string;
    mimeType: string;
    size: number;
    position: number;
  }[];

  likesCount!: number;
  commentsCount!: number;
}
