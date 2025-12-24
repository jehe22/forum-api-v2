const AddLikeUnlikeComment = require('../AddLikeUnlikeComment');

describe('a AddLikeUnlikeComment entities', () => {
  it('should create AddLikeUnlikeComment object correctly', () => {
    // Action
    const addLikeUnlikeComment = new AddLikeUnlikeComment();

    // Assert
    expect(addLikeUnlikeComment).toBeInstanceOf(AddLikeUnlikeComment);
  });
});
