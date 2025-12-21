const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const GetThreadUseCase = require('../../../../Applications/use_case/GetThreadUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadHandler = this.getThreadHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const authorizationHeader = request.headers.authorization;
    const payload = { ...request.payload, authorizationHeader };

    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const addedThread = await addThreadUseCase.execute(payload);

    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }

  async getThreadHandler(request, h) {
    const { id } = request.params;
    const payload = { threadId: id };

    const getThreadUseCase = this._container.getInstance(GetThreadUseCase.name);
    const getThread = await getThreadUseCase.execute(payload);

    const response = h.response({
      status: 'success',
      data: {
        thread: getThread,
      },
    });
    response.code(200);
    return response;
  }
}

module.exports = ThreadsHandler;
