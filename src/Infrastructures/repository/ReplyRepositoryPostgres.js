const AddedReply = require('../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(addReply) {
    const { content, owner, commentId } = addReply;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();
    const isdelete = false;

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, content, date, owner, commentId, isdelete],
    };

    const result = await this._pool.query(query);

    return new AddedReply({ ...result.rows[0] });
  }

  async getRepliesByCommentId(commentId) {
    const query = {
      text: 'SELECT id, content, date, owner, isdelete FROM replies WHERE repliedcomment = $1 ORDER BY date ASC',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async verifyRepliesById(id) {
    const query = {
      text: 'SELECT id FROM replies WHERE id = $1 AND isdelete = false',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (result.rows.length === 0) {
      throw new NotFoundError('reply tidak ditemukan di database');
    }
  }

  async verifyRepliesOwner({ id, owner }) {
    const query = {
      text: 'SELECT id FROM replies WHERE id = $1 AND owner = $2',
      values: [id, owner],
    };

    const result = await this._pool.query(query);

    if (result.rows.length === 0) {
      throw new AuthorizationError('anda bukan pemilik replies');
    }
  }

  async deleteRepliesById(id) {
    const query = {
      text: 'UPDATE replies SET isdelete = true WHERE id = $1',
      values: [id],
    };

    await this._pool.query(query);
  }
}

module.exports = ReplyRepositoryPostgres;
