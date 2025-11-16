'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('page_access_settings', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      page_route: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
        comment: 'The route/path of the page (e.g., /, /teams, /players-list)'
      },
      page_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Human-readable name of the page'
      },
      public_access: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: 'Whether the page is accessible without authentication'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Description of the page and its purpose'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add index on page_route for faster lookups
    await queryInterface.addIndex('page_access_settings', ['page_route'], {
      name: 'idx_page_route',
      unique: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('page_access_settings', 'idx_page_route');
    await queryInterface.dropTable('page_access_settings');
  }
};
