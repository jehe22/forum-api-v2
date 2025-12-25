const LikeRepository = require('../../Domains/likes/LikeRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addLike(addLike) {
    const { owner, commentId } = addLike;
    const id = `like-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO likes VALUES($1, $2, $3)',
      values: [id, owner, commentId],
    };

    await this._pool.query(query);
  }

  async getLikeCountsByCommentId(commentId) {
    const query = {
      text: 'SELECT id FROM likes WHERE likedcomment = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    return result.rows.length;
  }

  async verifyLikesByOwnerAndCommentId(verifyRepliesByOwnerAndCommentId) {
    const { owner, commentId } = verifyRepliesByOwnerAndCommentId;

    const query = {
      text: 'SELECT id FROM likes WHERE owner = $1 AND likedcomment = $2',
      values: [owner, commentId],
    };

    const result = await this._pool.query(query);

    if (result.rows.length === 0) {
      throw new NotFoundError('owner likes tidak ditemukan di database');
    }
  }

  async deleteLike(deleteLike) {
    const { owner, commentId } = deleteLike;

    const query = {
      text: 'DELETE FROM likes WHERE owner = $1 AND likedcomment = $2',
      values: [owner, commentId],
    };

    await this._pool.query(query);
  }
}

module.exports = LikeRepositoryPostgres;
