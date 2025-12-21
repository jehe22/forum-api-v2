const AddedThread = require('../AddedThread');

describe('a AddedThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'Dicoding Indonesia',
      owner: 'user-123',
    };

    // Action and Assert
    expect(() => new AddedThread(payload)).toThrow(new Error('ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY'));
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      title: 'dicoding',
      owner: {},
    };

    // Action and Assert
    expect(() => new AddedThread(payload)).toThrow(new Error('ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION'));
  });

  it('should create addedThread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'Thread dari Dicoding Indonesia',
      owner: 'user-123',
    };

    // Action
    const addedThread = new AddedThread(payload);

    // Assert
    expect(addedThread.id).toEqual(payload.id);
    expect(addedThread.title).toEqual(payload.title);
    expect(addedThread.owner).toEqual(payload.owner);
  });
});
