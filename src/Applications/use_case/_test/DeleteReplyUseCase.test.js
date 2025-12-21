const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const UserRepository = require('../../../Domains/users/UserRepository');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should give error when auth header not provided', async () => {
    // Arrange
    const useCasePayload = {
      authorizationHeader: '',
    };

    /** creating use case instance */
    const deleteReplyUseCase = new DeleteReplyUseCase({});

    // Assert
    await expect(deleteReplyUseCase.execute(useCasePayload)).rejects.toThrow(new Error('DELETE_REPLY_USE_CASE.NOT_CONTAIN_AUTHENTICATION_HEADER'));
  });

  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      replyId: 'reply-456',
      authorizationHeader: 'Bearer 01BA',
    };

    /** creating dependency of use case */
    const mockReplyRepository = new ReplyRepository();
    const mockUserRepository = new UserRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    /** mocking needed function */
    mockReplyRepository.deleteRepliesById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockUserRepository.getIdByUsername = jest.fn()
      .mockImplementation(() => Promise.resolve('user-123'));
    mockReplyRepository.verifyRepliesById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyRepliesOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockAuthenticationTokenManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve({ username: 'dicoding' }));

    /** creating use case instance */
    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      userRepository: mockUserRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action
    await deleteReplyUseCase.execute(useCasePayload);

    // Assert
    expect(mockAuthenticationTokenManager.decodePayload).toBeCalledWith('01BA');
    expect(mockReplyRepository.verifyRepliesById).toBeCalledWith(useCasePayload.replyId);
    expect(mockUserRepository.getIdByUsername).toBeCalledWith('dicoding');
    expect(mockReplyRepository.verifyRepliesOwner).toBeCalledWith({ id: useCasePayload.replyId, owner: 'user-123' });
    expect(mockReplyRepository.deleteRepliesById).toBeCalledWith(useCasePayload.replyId);
  });
});
