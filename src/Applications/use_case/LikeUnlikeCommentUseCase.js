/* eslint-disable class-methods-use-this */
const AddLikeUnlikeComment = require('../../Domains/likes/entities/AddLikeUnlikeComment');

class LikeUnlikeCommentUseCase {
  constructor({
    likeRepository,
    commentRepository,
    userRepository,
    threadRepository,
    authenticationTokenManager,
  }) {
    this._likeRepository = likeRepository;
    this._commentRepository = commentRepository;
    this._userRepository = userRepository;
    this._threadRepository = threadRepository;
    this._authenticationTokenManager = authenticationTokenManager;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);

    const accessToken = useCasePayload.authorizationHeader.split(' ')[1];

    const { username } = await this._authenticationTokenManager.decodePayload(accessToken);

    await this._threadRepository.verifyThreadsById(useCasePayload.threadId);

    await this._commentRepository.verifyCommentsById(useCasePayload.commentId);

    const addLikeUnlikeComment = new AddLikeUnlikeComment();

    addLikeUnlikeComment.owner = await this._userRepository.getIdByUsername(username);
    addLikeUnlikeComment.commentId = useCasePayload.commentId;

    try {
      await this._likeRepository.verifyLikesByOwnerAndCommentId(addLikeUnlikeComment);

      return this._likeRepository.deleteLike(addLikeUnlikeComment);
    } catch (error) {
      return this._likeRepository.addLike(addLikeUnlikeComment);
    }
  }

  _validatePayload(payload) {
    const { authorizationHeader } = payload;

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      throw new Error('LIKE_UNLIKE_COMMENT_USE_CASE.NOT_CONTAIN_AUTHENTICATION_HEADER');
    }
  }
}

module.exports = LikeUnlikeCommentUseCase;
