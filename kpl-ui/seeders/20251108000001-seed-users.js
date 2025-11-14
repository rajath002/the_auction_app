'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPasswords = {
      admin: await bcrypt.hash('admin123', 10),
      user: await bcrypt.hash('user123', 10),
      demo: await bcrypt.hash('demo123', 10),
    };

    await queryInterface.bulkInsert('users', [
      {
        name: 'Admin User',
        email: 'admin@kpl.com',
        password: hashedPasswords.admin,
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Test User',
        email: 'user@kpl.com',
        password: hashedPasswords.user,
        role: 'user',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Demo User',
        email: 'demo@kpl.com',
        password: hashedPasswords.demo,
        role: 'user',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Auction Manager',
        email: 'auction@kpl.com',
        password: await bcrypt.hash('auction123m', 10),
        role: 'manager',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});

    // Reset the auto-increment sequence to continue from the highest ID
    await queryInterface.sequelize.query(
        "SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT MAX(id) FROM users));"
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: ['admin@kpl.com', 'user@kpl.com', 'demo@kpl.com']
    }, {});
  }
};
