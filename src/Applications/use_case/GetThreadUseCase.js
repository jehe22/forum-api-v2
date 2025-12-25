class GetThreadUseCase {
  constructor({
    threadRepository, commentRepository, replyRepository, likeRepository, userRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._likeRepository = likeRepository;
    this._userRepository = userRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.verifyThreadsById(useCasePayload.threadId);

    const { owner, ...threadRest } = await this._threadRepository.getThreadsById(
      useCasePayload.threadId,
    );

    const username = await this._userRepository.getUsernameById(owner);

    const getComments = await this._commentRepository.getCommentsByThreadId(
      useCasePayload.threadId,
    );

    const comments = await Promise.all(
      getComments.map(async (getComment) => {
        const {
          owner: commentOwner,
          isdelete: commentIsdelete,
          ...commentRest
        } = getComment;

        const commentUsername = await this._userRepository.getUsernameById(commentOwner);

        const likeCount = await this._likeRepository.getLikeCountsByCommentId(getComment.id);

        if (commentIsdelete === true) {
          return {
            ...commentRest, content: '**komentar telah dihapus**', username: commentUsername, likeCount,
          };
        }

        const getReplies = await this._replyRepository.getRepliesByCommentId(getComment.id);

        const replies = await Promise.all(
          getReplies.map(async (getReply) => {
            const {
              owner: replyOwner,
              isdelete: replyIsdelete,
              ...replyRest
            } = getReply;

            const replyUsername = await this._userRepository.getUsernameById(replyOwner);

            if (replyIsdelete === true) {
              return { ...replyRest, content: '**balasan telah dihapus**', username: replyUsername };
            }

            return { ...replyRest, username: replyUsername };
          }),
        );

        return {
          ...commentRest, username: commentUsername, likeCount, replies,
        };
      }),
    );

    return { ...threadRest, username, comments };
  }
}

module.exports = GetThreadUseCase;
