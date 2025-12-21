/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.createTable('replies', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    content: {
      type: 'TEXT',
      notNull: true,
    },
    date: {
      type: 'TEXT',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    repliedcomment: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    isdelete: {
      type: 'BOOLEAN',
      notNull: true,
      defaultValue: false,
    },
  });

  pgm.addConstraint('replies', 'fk_replies.owner_users.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE');
  pgm.addConstraint('replies', 'fk_replies.repliedcomment_comments.id', 'FOREIGN KEY(repliedcomment) REFERENCES comments(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropTable('replies');
};
