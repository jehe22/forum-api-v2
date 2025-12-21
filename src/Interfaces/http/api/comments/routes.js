const routes = (handler) => ([
  {
    method: 'POST',
    path: '/threads/{id}/comments',
    handler: handler.postCommentHandler,
  },
  {
    method: 'DELETE',
    path: '/threads/{threadId}/comments/{commentId}',
    handler: handler.deleteCommentHandler,
  },
]);

module.exports = routes;
