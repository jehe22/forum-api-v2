/* eslint-disable class-methods-use-this */

const AddReply = require('../../Domains/replies/entities/AddReply');

class AddReplyUseCase {
  constructor({
    replyRepository,
    commentRepository,
    userRepository,
    threadRepository,
    authenticationTokenManager,
  }) {
    this._replyRepository = replyRepository;
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

    await this._commentRepository.verifyCommentsById(useCasePayload.commentId);

    const addReply = new AddReply(useCasePayload);

    addReply.owner = await this._userRepository.getIdByUsername(username);
    addReply.commentId = useCasePayload.commentId;

    return this._replyRepository.addReply(addReply);
  }

  _validatePayload(payload) {
    const { authorizationHeader } = payload;

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      throw new Error('ADD_REPLY_USE_CASE.NOT_CONTAIN_AUTHENTICATION_HEADER');
    }
  }
}

module.exports = AddReplyUseCase;
