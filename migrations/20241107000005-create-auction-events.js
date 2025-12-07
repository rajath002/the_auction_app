'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('auction_events', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      player_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'players',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      team_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'teams',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      bid_amount: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      event_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'BID'
      },
      bidder_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create indexes
    await queryInterface.addIndex('auction_events', ['player_id']);
    await queryInterface.addIndex('auction_events', ['team_id']);
    await queryInterface.addIndex('auction_events', ['created_at']);
    await queryInterface.addIndex('auction_events', ['player_id', 'created_at'], {
      name: 'idx_auction_player_time'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('auction_events', ['player_id']);
    await queryInterface.removeIndex('auction_events', ['team_id']);
    await queryInterface.removeIndex('auction_events', ['created_at']);
    await queryInterface.removeIndex('auction_events', 'idx_auction_player_time');
    await queryInterface.dropTable('auction_events');
  }
};
