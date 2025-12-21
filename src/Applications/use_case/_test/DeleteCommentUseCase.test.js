const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const UserRepository = require('../../../Domains/users/UserRepository');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should give error when auth header not provided', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-234',
      commentId: 'comment-456',
      authorizationHeader: '',
    };

    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({});

    // Assert
    await expect(deleteCommentUseCase.execute(useCasePayload)).rejects.toThrow(new Error('DELETE_COMMENT_USE_CASE.NOT_CONTAIN_AUTHENTICATION_HEADER'));
  });

  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-234',
      commentId: 'comment-456',
      authorizationHeader: 'Bearer 01BA',
    };

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockUserRepository = new UserRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    /** mocking needed function */
    mockCommentRepository.deleteCommentsById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockUserRepository.getIdByUsername = jest.fn()
      .mockImplementation(() => Promise.resolve('user-123'));
    mockThreadRepository.verifyThreadsById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentsById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentsOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockAuthenticationTokenManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve({ username: 'dicoding' }));

    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      userRepository: mockUserRepository,
      threadRepository: mockThreadRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action
    await deleteCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockAuthenticationTokenManager.decodePayload).toBeCalledWith('01BA');
    expect(mockThreadRepository.verifyThreadsById).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentsById).toBeCalledWith(useCasePayload.commentId);
    expect(mockUserRepository.getIdByUsername).toBeCalledWith('dicoding');
    expect(mockCommentRepository.verifyCommentsOwner).toBeCalledWith({ id: useCasePayload.commentId, owner: 'user-123' });
    expect(mockCommentRepository.deleteCommentsById).toBeCalledWith(useCasePayload.commentId);
  });
});
