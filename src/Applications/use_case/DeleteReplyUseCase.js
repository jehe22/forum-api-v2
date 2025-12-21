/* eslint-disable class-methods-use-this */

class DeleteReplyUseCase {
  constructor({ replyRepository, userRepository, authenticationTokenManager }) {
    this._replyRepository = replyRepository;
    this._userRepository = userRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);

    const id = useCasePayload.replyId;

    const accessToken = useCasePayload.authorizationHeader.split(' ')[1];

    const { username } = await this._authenticationTokenManager.decodePayload(accessToken);

    await this._replyRepository.verifyRepliesById(id);

    const owner = await this._userRepository.getIdByUsername(username);

    await this._replyRepository.verifyRepliesOwner({ id, owner });

    await this._replyRepository.deleteRepliesById(id);
  }

  _validatePayload(payload) {
    const { authorizationHeader } = payload;

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      throw new Error('DELETE_REPLY_USE_CASE.NOT_CONTAIN_AUTHENTICATION_HEADER');
    }
  }
}

module.exports = DeleteReplyUseCase;
