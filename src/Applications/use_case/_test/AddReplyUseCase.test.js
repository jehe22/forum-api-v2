const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const UserRepository = require('../../../Domains/users/UserRepository');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const AddReplyUseCase = require('../AddReplyUseCase');
const AddReply = require('../../../Domains/replies/entities/AddReply');

describe('AddReplyUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should give error when auth header not provided', async () => {
    // Arrange
    const useCasePayload = {
      content: 'secret reply onlyfor you all',
      authorizationHeader: '',
    };

    /** creating use case instance */
    const addReplyUseCase = new AddReplyUseCase({});

    // Assert
    await expect(addReplyUseCase.execute(useCasePayload)).rejects.toThrow(new Error('ADD_REPLY_USE_CASE.NOT_CONTAIN_AUTHENTICATION_HEADER'));
  });

  it('should orchestrating the add reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'secret comment thread onlyfor you all',
      authorizationHeader: 'Bearer 01BA',
      threadId: 'thread-467',
      commentId: 'comment-678',
    };

    const mockAddedReply = new AddedReply({
      id: 'reply-789',
      content: useCasePayload.content,
      owner: 'user-123',
    });

    /** creating dependency of use case */
    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockUserRepository = new UserRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    /** mocking needed function */
    mockReplyRepository.addReply = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddedReply));
    mockUserRepository.getIdByUsername = jest.fn()
      .mockImplementation(() => Promise.resolve('user-123'));
    mockThreadRepository.verifyThreadsById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentsById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockAuthenticationTokenManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve({ username: 'dicoding' }));

    /** creating use case instance */
    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      userRepository: mockUserRepository,
      threadRepository: mockThreadRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action
    const addedReply = await addReplyUseCase.execute(useCasePayload);

    // Assert
    expect(addedReply).toStrictEqual(new AddedReply({
      id: mockAddedReply.id,
      content: useCasePayload.content,
      owner: mockAddedReply.owner,
    }));

    expect(mockUserRepository.getIdByUsername).toBeCalledWith('dicoding');

    expect(mockThreadRepository.verifyThreadsById).toBeCalledWith('thread-467');

    expect(mockCommentRepository.verifyCommentsById).toBeCalledWith('comment-678');

    expect(mockAuthenticationTokenManager.decodePayload).toBeCalledWith('01BA');

    expect(mockReplyRepository.addReply).toBeCalledWith({
      ...new AddReply({
        content: useCasePayload.content,
      }),
      owner: mockAddedReply.owner,
      commentId: useCasePayload.commentId,
    });
  });
});
