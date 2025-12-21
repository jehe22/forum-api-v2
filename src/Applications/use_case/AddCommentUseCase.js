/* eslint-disable class-methods-use-this */

const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({
    commentRepository, userRepository, threadRepository, authenticationTokenManager,
  }) {
    this._commentRepository = commentRepository;
    this._userRepository = userRepository;
    this._threadRepository = threadRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);

    const accessToken = useCasePayload.authorizationHeader.split(' ')[1];

    const { username } = await this._authenticationTokenManager.decodePayload(accessToken);

    await this._threadRepository.verifyThreadsById(useCasePayload.threadId);

    const addComment = new AddComment(useCasePayload);

    addComment.owner = await this._userRepository.getIdByUsername(username);
    addComment.threadId = useCasePayload.threadId;

    return this._commentRepository.addComment(addComment);
  }

  _validatePayload(payload) {
    const { authorizationHeader } = payload;

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      throw new Error('ADD_COMMENT_USE_CASE.NOT_CONTAIN_AUTHENTICATION_HEADER');
    }
  }
}

module.exports = AddCommentUseCase;
