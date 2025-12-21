const ReplyRepository = require('../ReplyRepository');

describe('ReplyRepository interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const replyRepository = new ReplyRepository();

    // Action and Assert
    await expect(replyRepository.addReply()).rejects.toThrow(new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED'));

    await expect(replyRepository.getRepliesByCommentId()).rejects.toThrow(new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED'));

    await expect(replyRepository.verifyRepliesById()).rejects.toThrow(new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED'));

    await expect(replyRepository.verifyRepliesOwner({})).rejects.toThrow(new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED'));

    await expect(replyRepository.deleteRepliesById()).rejects.toThrow(new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED'));
  });
});
