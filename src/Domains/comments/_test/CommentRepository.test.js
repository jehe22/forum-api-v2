const CommentRepository = require('../CommentRepository');

describe('CommentRepository interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const commentRepository = new CommentRepository();

    // Action and Assert
    await expect(commentRepository.addComment({})).rejects.toThrow(new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED'));

    await expect(commentRepository.getCommentsByThreadId()).rejects.toThrow(new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED'));

    await expect(commentRepository.verifyCommentsById()).rejects.toThrow(new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED'));

    await expect(commentRepository.verifyCommentsOwner({})).rejects.toThrow(new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED'));

    await expect(commentRepository.deleteCommentsById()).rejects.toThrow(new Error('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED'));
  });
});
