/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-123', content = 'dicoding commentar', date = '28 Des 2023', owner = 'user-123', commentedthread = 'thread-123', isdelete = false,
  }) {
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, content, date, owner, commentedthread, isdelete],
    };

    await pool.query(query);
  },

  async deleteComment({ id = 'comment-123' }) {
    const query = {
      text: 'UPDATE comments SET isdelete = true WHERE id = $1',
      values: [id],
    };

    await pool.query(query);
  },

  async findCommentsById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
