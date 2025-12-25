const LikeRepository = require('../../../Domains/likes/LikeRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const UserRepository = require('../../../Domains/users/UserRepository');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const LikeUnlikeCommentUseCase = require('../LikeUnlikeCommentUseCase');

describe('LikeUnlikeCommentUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should give error when auth header not provided', async () => {
    // Arrange
    const useCasePayload = {
      authorizationHeader: '',
    };

    /** creating use case instance */
    const likeUnlikeCommentUseCase = new LikeUnlikeCommentUseCase({});

    // Assert
    await expect(likeUnlikeCommentUseCase.execute(useCasePayload)).rejects.toThrow(new Error('LIKE_UNLIKE_COMMENT_USE_CASE.NOT_CONTAIN_AUTHENTICATION_HEADER'));
  });

  it('should orchestrating the like action correctly', async () => {
    // Arrange
    const useCasePayload = {
      authorizationHeader: 'Bearer 01BA',
      threadId: 'thread-467',
      commentId: 'comment-678',
    };

    /** creating dependency of use case */
    const mockLikeRepository = new LikeRepository();
    const mockCommentRepository = new CommentRepository();
    const mockUserRepository = new UserRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    /** mocking needed function */
    mockLikeRepository.addLike = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.deleteLike = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.verifyLikesByOwnerAndCommentId = jest.fn()
      .mockImplementation(() => Promise.reject());
    mockUserRepository.getIdByUsername = jest.fn()
      .mockImplementation(() => Promise.resolve('user-123'));
    mockThreadRepository.verifyThreadsById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentsById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockAuthenticationTokenManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve({ username: 'dicoding' }));

    /** creating use case instance */
    const likeUnlikeCommentUseCase = new LikeUnlikeCommentUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      userRepository: mockUserRepository,
      threadRepository: mockThreadRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action
    await likeUnlikeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockUserRepository.getIdByUsername).toBeCalledWith('dicoding');

    expect(mockThreadRepository.verifyThreadsById).toBeCalledWith('thread-467');

    expect(mockCommentRepository.verifyCommentsById).toBeCalledWith('comment-678');

    expect(mockAuthenticationTokenManager.decodePayload).toBeCalledWith('01BA');

    expect(mockLikeRepository.verifyLikesByOwnerAndCommentId).toBeCalledWith({
      owner: 'user-123',
      commentId: useCasePayload.commentId,
    });

    expect(mockLikeRepository.addLike).toBeCalledWith({
      owner: 'user-123',
      commentId: useCasePayload.commentId,
    });

    expect(mockLikeRepository.deleteLike).not.toBeCalled();
  });

  it('should orchestrating the unlike action correctly', async () => {
    // Arrange
    const useCasePayload = {
      authorizationHeader: 'Bearer 01BA',
      threadId: 'thread-467',
      commentId: 'comment-678',
    };

    /** creating dependency of use case */
    const mockLikeRepository = new LikeRepository();
    const mockCommentRepository = new CommentRepository();
    const mockUserRepository = new UserRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    /** mocking needed function */
    mockLikeRepository.addLike = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.deleteLike = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.verifyLikesByOwnerAndCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockUserRepository.getIdByUsername = jest.fn()
      .mockImplementation(() => Promise.resolve('user-123'));
    mockThreadRepository.verifyThreadsById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentsById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockAuthenticationTokenManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve({ username: 'dicoding' }));

    /** creating use case instance */
    const likeUnlikeCommentUseCase = new LikeUnlikeCommentUseCase({
      likeRepository: mockLikeRepository,
      commentRepository: mockCommentRepository,
      userRepository: mockUserRepository,
      threadRepository: mockThreadRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action
    await likeUnlikeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockUserRepository.getIdByUsername).toBeCalledWith('dicoding');

    expect(mockThreadRepository.verifyThreadsById).toBeCalledWith('thread-467');

    expect(mockCommentRepository.verifyCommentsById).toBeCalledWith('comment-678');

    expect(mockAuthenticationTokenManager.decodePayload).toBeCalledWith('01BA');

    expect(mockLikeRepository.verifyLikesByOwnerAndCommentId).toBeCalledWith({
      owner: 'user-123',
      commentId: useCasePayload.commentId,
    });

    expect(mockLikeRepository.deleteLike).toBeCalledWith({
      owner: 'user-123',
      commentId: useCasePayload.commentId,
    });

    expect(mockLikeRepository.addLike).not.toBeCalled();
  });
});
