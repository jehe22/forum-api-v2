/* eslint-disable class-methods-use-this */

class DeleteCommentUseCase {
  constructor({
    commentRepository, threadRepository, userRepository, authenticationTokenManager,
  }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
    this._userRepository = userRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);

    const { threadId } = useCasePayload;
    const { commentId: id } = useCasePayload;

    const accessToken = useCasePayload.authorizationHeader.split(' ')[1];

    const { username } = await this._authenticationTokenManager.decodePayload(accessToken);

    await this._threadRepository.verifyThreadsById(threadId);
    await this._commentRepository.verifyCommentsById(id);

    const owner = await this._userRepository.getIdByUsername(username);

    await this._commentRepository.verifyCommentsOwner({ id, owner });

    await this._commentRepository.deleteCommentsById(id);
  }

  _validatePayload(payload) {
    const { authorizationHeader } = payload;

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      throw new Error('DELETE_COMMENT_USE_CASE.NOT_CONTAIN_AUTHENTICATION_HEADER');
    }
  }
}

module.exports = DeleteCommentUseCase;
