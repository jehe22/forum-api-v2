const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const UserRepository = require('../../../Domains/users/UserRepository');
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should give error when auth header not provided', async () => {
    // Arrange
    const useCasePayload = {
      title: 'secret thread onlyfor you all',
      body: 'sttssttt',
      authorizationHeader: '',
    };

    /** creating use case instance */
    const addThreadUseCase = new AddThreadUseCase({});

    // Assert
    await expect(addThreadUseCase.execute(useCasePayload)).rejects.toThrow(new Error('ADD_THREAD_USE_CASE.NOT_CONTAIN_AUTHENTICATION_HEADER'));
  });

  it('should orchestrating the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'secret thread onlyfor you all',
      body: 'sttssttt',
      authorizationHeader: 'Bearer 01BA',
    };

    const mockAddedThread = new AddedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: 'user-123',
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockUserRepository = new UserRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();

    /** mocking needed function */
    mockThreadRepository.addThread = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddedThread));
    mockUserRepository.getIdByUsername = jest.fn()
      .mockImplementation(() => Promise.resolve('user-123'));
    mockAuthenticationTokenManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve({ username: 'dicoding' }));

    /** creating use case instance */
    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
    });

    // Action
    const addedThread = await addThreadUseCase.execute(useCasePayload);

    // Assert
    expect(addedThread).toStrictEqual(new AddedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: mockAddedThread.owner,
    }));

    expect(mockUserRepository.getIdByUsername).toBeCalledWith('dicoding');

    expect(mockAuthenticationTokenManager.decodePayload).toBeCalledWith('01BA');

    expect(mockThreadRepository.addThread).toBeCalledWith({
      ...new AddThread({
        title: useCasePayload.title,
        body: useCasePayload.body,
      }),
      owner: mockAddedThread.owner,
    });
  });
});
