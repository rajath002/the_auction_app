'use strict';

const playersData = require('../data/players.json');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Transform players data to match database schema
    const players = playersData.slice(0, 10).map(player => ({
      id: player.id,
      name: player.name,
      image: player.image,
      type: player.type === 'Wicketkeeper' ? 'Wicket-Keeper' : player.type,
      category: player.category,
      current_bid: player.currentBid || 0,
      base_value: player.stats?.baseValue || 200,
      bid_value: player.stats?.bidValue || null,
      current_team_id: player.stats?.currentTeamId || null,
      status: player.stats?.status || null,
      created_at: new Date(),
      updated_at: new Date()
    }));

    await queryInterface.bulkInsert('players', players, {});

    // Reset the auto-increment sequence to continue from the highest ID
    await queryInterface.sequelize.query(
        "SELECT setval(pg_get_serial_sequence('players', 'id'), (SELECT MAX(id) FROM players));"
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('players', null, {});
  }
};
