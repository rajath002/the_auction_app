'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('players', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      image: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      type: {
        type: Sequelize.ENUM('Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'),
        allowNull: false
      },
      category: {
        type: Sequelize.ENUM('L1', 'L2', 'L3', 'L4'),
        allowNull: false
      },
      role: {
        type: Sequelize.STRING(25),
        allowNull: true
      },
      current_bid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      base_value: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      bid_value: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      current_team_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'teams',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      status: {
        type: Sequelize.ENUM('SOLD', 'UNSOLD', 'AVAILABLE', 'In-Progress'),
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create indexes
    await queryInterface.addIndex('players', ['type']);
    await queryInterface.addIndex('players', ['category']);
    await queryInterface.addIndex('players', ['role']);
    await queryInterface.addIndex('players', ['status']);
    await queryInterface.addIndex('players', ['current_team_id']);
    await queryInterface.addIndex('players', ['name'], {
      name: 'idx_players_name'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes
    await queryInterface.removeIndex('players', ['type']);
    await queryInterface.removeIndex('players', ['category']);
    await queryInterface.removeIndex('players', ['role']);
    await queryInterface.removeIndex('players', ['status']);
    await queryInterface.removeIndex('players', ['current_team_id']);
    await queryInterface.removeIndex('players', 'idx_players_name');
    
    // Drop the table
    await queryInterface.dropTable('players');
    
    // Drop the ENUM types
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_players_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_players_category";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_players_status";');
  }
};
