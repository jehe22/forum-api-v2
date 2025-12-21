const AddThread = require('../AddThread');

describe('a PostThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'title',
    };

    // Action and Assert
    expect(() => new AddThread(payload)).toThrow(new Error('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY'));
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      title: 2,
      body: true,
    };

    // Action and Assert
    expect(() => new AddThread(payload)).toThrow(new Error('ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION'));
  });

  it('should create PostThread object correctly', () => {
    // Arrange
    const payload = {
      title: 'Thread Dicoding',
      body: 'dicoding indonesia bla bla',
    };

    // Action
    const { title, body } = new AddThread(payload);

    // Assert
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
  });
});
