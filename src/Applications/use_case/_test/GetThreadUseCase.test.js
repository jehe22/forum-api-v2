const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const UserRepository = require('../../../Domains/users/UserRepository');
const GetThreadUseCase = require('../GetThreadUseCase');

describe('GetThreadUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the get thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-234',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockUserRepository = new UserRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadsById = jest.fn().mockImplementation(() => Promise.resolve());
    mockThreadRepository.getThreadsById = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: 'thread-234',
        title: 'thread milik seseorang',
        body: 'alayy banarr',
        date: '29 Jan 2023',
        owner: 'user-123',
      }));

    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([{
        id: 'comment-345',
        content: 'memang alayy',
        date: '30 Jan 2023',
        owner: 'user-789',
      }]));

    mockReplyRepository.getRepliesByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve([{
        id: 'reply-456',
        content: 'balasan memang alayy',
        date: '30 Jan 2025',
        owner: 'user-678',
      }]));

    mockUserRepository.getUsernameById = jest.fn()
      .mockImplementation(() => Promise.resolve('dicoding'));

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      userRepository: mockUserRepository,
    });

    // Action
    const thread = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(thread).toStrictEqual({
      id: 'thread-234',
      title: 'thread milik seseorang',
      body: 'alayy banarr',
      date: '29 Jan 2023',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-345',
          content: 'memang alayy',
          date: '30 Jan 2023',
          username: 'dicoding',
          replies: [
            {
              id: 'reply-456',
              content: 'balasan memang alayy',
              date: '30 Jan 2025',
              username: 'dicoding',
            },
          ],
        },
      ],
    });

    expect(mockThreadRepository.verifyThreadsById).toBeCalledWith('thread-234');
    expect(mockThreadRepository.getThreadsById).toBeCalledWith('thread-234');
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith('thread-234');
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith('comment-345');
    expect(mockUserRepository.getUsernameById).toBeCalledWith('user-123');
    expect(mockUserRepository.getUsernameById).toBeCalledWith('user-789');
    expect(mockUserRepository.getUsernameById).toBeCalledWith('user-678');
  });

  it('should return komentar telah dihapus when comment has been deleted', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-234',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockUserRepository = new UserRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadsById = jest.fn().mockImplementation(() => Promise.resolve());
    mockThreadRepository.getThreadsById = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: 'thread-234',
        title: 'thread milik seseorang',
        body: 'alayy banarr',
        date: '29 Jan 2023',
        owner: 'user-123',
      }));

    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([{
        id: 'comment-345',
        content: 'memang alayy',
        date: '30 Jan 2023',
        owner: 'user-789',
        isdelete: true,
      }]));

    mockReplyRepository.getRepliesByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve([{
        id: 'reply-456',
        content: 'balasan memang alayy',
        date: '30 Jan 2025',
        owner: 'user-678',
        isdelete: false,
      }]));

    mockUserRepository.getUsernameById = jest.fn()
      .mockImplementation(() => Promise.resolve('dicoding'));

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      userRepository: mockUserRepository,
    });

    // Action
    const thread = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(thread).toStrictEqual({
      id: 'thread-234',
      title: 'thread milik seseorang',
      body: 'alayy banarr',
      date: '29 Jan 2023',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-345',
          content: '**komentar telah dihapus**',
          date: '30 Jan 2023',
          username: 'dicoding',
        },
      ],
    });
  });

  it('should return balasan telah dihapus when reply has been deleted', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-234',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockUserRepository = new UserRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadsById = jest.fn().mockImplementation(() => Promise.resolve());
    mockThreadRepository.getThreadsById = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: 'thread-234',
        title: 'thread milik seseorang',
        body: 'alayy banarr',
        date: '29 Jan 2023',
        owner: 'user-123',
      }));

    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([{
        id: 'comment-345',
        content: 'memang alayy',
        date: '30 Jan 2023',
        owner: 'user-789',
        isdelete: false,
      }]));

    mockReplyRepository.getRepliesByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve([{
        id: 'reply-456',
        content: 'balasan memang alayy',
        date: '30 Jan 2025',
        owner: 'user-678',
        isdelete: true,
      }]));

    mockUserRepository.getUsernameById = jest.fn()
      .mockImplementation(() => Promise.resolve('dicoding'));

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      userRepository: mockUserRepository,
    });

    // Action
    const thread = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(thread).toStrictEqual({
      id: 'thread-234',
      title: 'thread milik seseorang',
      body: 'alayy banarr',
      date: '29 Jan 2023',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-345',
          content: 'memang alayy',
          date: '30 Jan 2023',
          username: 'dicoding',
          replies: [
            {
              id: 'reply-456',
              content: '**balasan telah dihapus**',
              date: '30 Jan 2025',
              username: 'dicoding',
            },
          ],
        },
      ],
    });
  });
});
