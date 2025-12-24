const LikeUnlikeCommentUseCase = require('../../../../Applications/use_case/LikeUnlikeCommentUseCase');

class LikesHandler {
  constructor(container) {
    this._container = container;

    this.putLikeHandler = this.putLikeHandler.bind(this);
  }

  async putLikeHandler(request, h) {
    const authorizationHeader = request.headers.authorization;
    const { threadId, commentId } = request.params;
    const payload = { threadId, commentId, authorizationHeader };

    const likeUnlikeCommentUseCase = this._container.getInstance(LikeUnlikeCommentUseCase.name);
    await likeUnlikeCommentUseCase.execute(payload);

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = LikesHandler;
