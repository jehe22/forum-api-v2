const AddReply = require('../AddReply');

describe('a AddReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {};

    // Action and Assert
    expect(() => new AddReply(payload)).toThrow(new Error('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY'));
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 2,
    };

    // Action and Assert
    expect(() => new AddReply(payload)).toThrow(new Error('ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION'));
  });

  it('should create AddReply object correctly', () => {
    // Arrange
    const payload = {
      content: 'dicoding indonesia membalas bla bla',
    };

    // Action
    const { content } = new AddReply(payload);

    // Assert
    expect(content).toEqual(payload.content);
  });
});
