/* eslint-disable class-methods-use-this */

const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
  constructor({ threadRepository, userRepository, authenticationTokenManager }) {
    this._threadRepository = threadRepository;
    this._userRepository = userRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);

    const accessToken = useCasePayload.authorizationHeader.split(' ')[1];

    const { username } = await this._authenticationTokenManager.decodePayload(accessToken);

    const addThread = new AddThread(useCasePayload);

    addThread.owner = await this._userRepository.getIdByUsername(username);

    return this._threadRepository.addThread(addThread);
  }

  _validatePayload(payload) {
    const { authorizationHeader } = payload;

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      throw new Error('ADD_THREAD_USE_CASE.NOT_CONTAIN_AUTHENTICATION_HEADER');
    }
  }
}

module.exports = AddThreadUseCase;
