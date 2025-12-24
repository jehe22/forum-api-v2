/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.createTable('likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    likedcomment: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  pgm.addConstraint('likes', 'fk_likes.owner_users.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE');
  pgm.addConstraint('likes', 'fk_likes.likedcomment_comments.id', 'FOREIGN KEY(likedcomment) REFERENCES comments(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropTable('likes');
};
