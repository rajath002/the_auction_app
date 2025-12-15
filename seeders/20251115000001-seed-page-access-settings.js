'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('page_access_settings', [
      {
        page_route: '/',
        page_name: 'Home',
        public_access: true,
        description: 'Landing page of the application',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        page_route: '/teams',
        page_name: 'Teams',
        public_access: false,
        description: 'View all teams and their players',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        page_route: '/about-us',
        page_name: 'About Us',
        public_access: true,
        description: 'Information about KPL',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        page_route: '/players-list',
        page_name: 'Players List',
        public_access: false,
        description: 'View all registered players',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        page_route: '/auction',
        page_name: 'Auction',
        public_access: false,
        description: 'Auction management interface (Admin and Manager only)',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        page_route: '/player-registration',
        page_name: 'Player Registration',
        public_access: false,
        description: 'Single player registration form (Admin only)',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        page_route: '/bulk-player-registration',
        page_name: 'Bulk Player Registration',
        public_access: false,
        description: 'Bulk player registration via CSV (Admin only)',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        page_route: '/page-access-management',
        page_name: 'Page Access Management',
        public_access: false,
        description: 'Manage page access settings (Admin only)',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        page_route: '/manage-players',
        page_name: 'Manage Players',
        public_access: false,
        description: 'Manage players (Admin only)',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        page_route: '/gallery',
        page_name: 'Gallery',
        public_access: false,
        description: 'Gallery page showcasing images and media',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        page_route: '/analytics',
        page_name: 'Analytics',
        public_access: false,
        description: 'Analytics dashboard (Admin and Manager only)',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});

    // Reset the auto-increment sequence
    await queryInterface.sequelize.query(
      "SELECT setval(pg_get_serial_sequence('page_access_settings', 'id'), (SELECT MAX(id) FROM page_access_settings));"
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('page_access_settings', null, {});
  }
};
