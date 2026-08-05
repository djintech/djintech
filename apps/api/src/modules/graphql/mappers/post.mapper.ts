import { FileUrlService } from '@src/core/file/file-url.service';
import { PostView } from '../dto/post.view';

export function mapPostToView( post: any, fileUrlService: FileUrlService ): PostView {
  return {
    id: post.id,
    ownerId: post.userId,
    description: post.description ?? '',
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,

    images: post.postImages.map((image) => ({
      url: fileUrlService.getPublicUrl(image.key),
      position: image.position,
    })),

    postOwner: {
      id: post.user.id,
      userName: post.user.username,
      avatar:
        post.user.profile?.avatar?.key
          ? fileUrlService.getPublicUrl(
              post.user.profile.avatar.key,
            )
          : null,
    },

    userBan:
      post.user.isBanned &&
      post.user.banReason &&
      post.user.banDate
        ? {
            reason: post.user.banReason,
            createdAt: post.user.banDate,
          }
        : null,
  };
}