const routes = (handler) => ([
  {
    method: 'POST',
    path: '/threads',
    handler: handler.postThreadHandler,
  },
  {
    method: 'GET',
    path: '/threads/{id}',
    handler: handler.getThreadHandler,
  },
]);

module.exports = routes;
