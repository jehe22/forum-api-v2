const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const UserRepository = require('../../../Domains/users/UserRepository');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should give error when auth header not provided', async () => {
    // Arrange
    const useCasePayload = {
      content: 'secret comment thread onlyfor you all',
      authorizationHeader: '',
    };

    /** creating use case instance */
    const addCommentUseCase = new AddCommentUseCase({});

    // Assert
    await expect(addCommentUseCase.execute(useCasePayload)).rejects.toThrow(new Error('ADD_COMMENT_USE_CASE.NOT_CONTAIN_AUTHENTICATION_HEADER'));
  });

  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'secret comment thread onlyfor you all',
      authorizationHeader: 'Bearer 01BA',
      threadId: 'thread-467',
    };

    const mockAddedComment = new AddedComment({
      id: 'thread-467',
      content: useCasePayload.content,
      owner: 'user-123',
    });

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockUserRepository = new UserRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    /** mocking needed function */
    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddedComment));
    mockUserRepository.getIdByUsername = jest.fn()
      .mockImplementation(() => Promise.resolve('user-123'));
    mockThreadRepository.verifyThreadsById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockAuthenticationTokenManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve({ username: 'dicoding' }));

    /** creating use case instance */
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      userRepository: mockUserRepository,
      threadRepository: mockThreadRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action
    const addedComment = await addCommentUseCase.execute(useCasePayload);

    // Assert
    expect(addedComment).toStrictEqual(new AddedComment({
      id: 'thread-467',
      content: useCasePayload.content,
      owner: 'user-123',
    }));

    expect(mockUserRepository.getIdByUsername).toBeCalledWith('dicoding');

    expect(mockThreadRepository.verifyThreadsById).toBeCalledWith('thread-467');

    expect(mockAuthenticationTokenManager.decodePayload).toBeCalledWith('01BA');

    expect(mockCommentRepository.addComment).toBeCalledWith({
      ...new AddComment({
        content: useCasePayload.content,
      }),
      owner: mockAddedComment.owner,
      threadId: useCasePayload.threadId,
    });
  });
});
