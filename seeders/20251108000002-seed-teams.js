"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "teams",
      [
        {
          name: "KGF",
          purse: 10000,
          owner: "Jaya Shetty",
          mentor: "",
          icon_player: "",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Silver Squad",
          purse: 10000,
          owner: "Guruprasad",
          mentor: "",
          icon_player: "",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Shabari Strikers",
          purse: 10000,
          owner: "Rajesh Shetty",
          mentor: "",
          icon_player: "",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Ocean Stunners",
          purse: 10000,
          owner: "Ashok Devadiga",
          mentor: "",
          icon_player: "",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Bhoomi Fighters",
          purse: 10000,
          owner: "Dheeraj Kulal",
          mentor: "",
          icon_player: "",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );

    // Reset the auto-increment sequence to continue from the highest ID
    await queryInterface.sequelize.query(
      "SELECT setval(pg_get_serial_sequence('teams', 'id'), (SELECT MAX(id) FROM teams));"
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      "teams",
      {
        name: [
          "KGF",
          "Silver Squad",
          "Shabari Strikers",
          "Ocean Stunners",
          "Bhoomi Fighters",
        ],
      },
      {}
    );
  },
};
