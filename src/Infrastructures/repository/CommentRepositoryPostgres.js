const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(addComment) {
    const { content, owner, threadId } = addComment;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();
    const isdelete = false;

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, content, date, owner, threadId, isdelete],
    };

    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: 'SELECT id, content, date, owner, isdelete FROM comments WHERE commentedthread = $1 ORDER BY date ASC',
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async verifyCommentsById(id) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1 AND isdelete = false',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (result.rows.length === 0) {
      throw new NotFoundError('comment tidak ditemukan di database');
    }
  }

  async verifyCommentsOwner({ id, owner }) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1 AND owner = $2',
      values: [id, owner],
    };

    const result = await this._pool.query(query);

    if (result.rows.length === 0) {
      throw new AuthorizationError('anda bukan pemilik comment');
    }
  }

  async deleteCommentsById(id) {
    const query = {
      text: 'UPDATE comments SET isdelete = true WHERE id = $1',
      values: [id],
    };

    await this._pool.query(query);
  }
}

module.exports = CommentRepositoryPostgres;
