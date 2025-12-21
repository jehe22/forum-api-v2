/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async addReply({
    id = 'reply-123', content = 'dicoding commentar reply', date = '28 Des 2023', owner = 'user-123', repliedcomment = 'comment-789', isdelete = false,
  }) {
    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, content, date, owner, repliedcomment, isdelete],
    };

    await pool.query(query);
  },

  async deleteReply({ id = 'reply-123' }) {
    const query = {
      text: 'UPDATE replies SET isdelete = true WHERE id = $1',
      values: [id],
    };

    await pool.query(query);
  },

  async findRepliesById(id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM replies WHERE 1=1');
  },
};

module.exports = RepliesTableTestHelper;
