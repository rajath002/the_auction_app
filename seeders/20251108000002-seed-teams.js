"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "teams",
      [
        {
          name: "KGF",
          purse: 12000,
          owner: "Jaya Shetty",
          mentor: "Nikhil Karmarjid",
          icon_player: "Dheeraj Shetty",
          image: "https://ik.imagekit.io/6c4tah4mp/logo/KATTEGANGFIGHTERS.jpg",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Silver Squad",
          purse: 12000,
          owner: "Guruprasad",
          mentor: "Santhosh Shetty",
          icon_player: "Praveen D acharya",
          image: "https://ik.imagekit.io/6c4tah4mp/logo/THESILVERSQUAD.jpg",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Shabari Strikers",
          purse: 12000,
          owner: "Rajesh Shetty",
          mentor: "Pawan Shetty",
          icon_player: "Shreepad Poojary",
          image: "https://ik.imagekit.io/6c4tah4mp/logo/SHABARISTRIKERSLOG.jpeg",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Ocean Stunners",
          purse: 12000,
          owner: "Ashok Devadiga",
          mentor: "Yogish Kulal",
          icon_player: "Adarsh Acharya",
          image: "https://ik.imagekit.io/6c4tah4mp/logo/OCEAN%20STUNNERS.jpg",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Bhoomi Fighters",
          purse: 12000,
          owner: "Dheeraj Kulal",
          mentor: "Praveen Acharya",
          icon_player: "Sandesh Poojary",
          image: "https://ik.imagekit.io/6c4tah4mp/logo/BHOOMI%20FIGHTERS.jpg",
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
