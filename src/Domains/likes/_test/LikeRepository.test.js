const LikeRepository = require('../LikeRepository');

describe('LikeRepository interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const likeRepository = new LikeRepository();

    // Action and Assert
    await expect(likeRepository.addLike()).rejects.toThrow(new Error('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED'));

    await expect(likeRepository.getLikeCountsByCommentId()).rejects.toThrow(new Error('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED'));

    await expect(likeRepository.verifyLikesByOwnerAndCommentId()).rejects.toThrow(new Error('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED'));

    await expect(likeRepository.deleteLike()).rejects.toThrow(new Error('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED'));
  });
});
