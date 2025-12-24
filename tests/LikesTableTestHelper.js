/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const LikesTableTestHelper = {
  async addLike({
    id = 'like-123', owner = 'user-123', likedcomment = 'comment-789',
  }) {
    const query = {
      text: 'INSERT INTO likes VALUES($1, $2, $3)',
      values: [id, owner, likedcomment],
    };

    await pool.query(query);
  },

  async deleteLike({ id = 'like-123' }) {
    const query = {
      text: 'DELETE FROM likes WHERE id = $1',
      values: [id],
    };

    await pool.query(query);
  },

  async findLikesById(id) {
    const query = {
      text: 'SELECT * FROM likes WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM likes WHERE 1=1');
  },
};

module.exports = LikesTableTestHelper;
