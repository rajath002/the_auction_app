'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create cricket_matches table
    await queryInterface.createTable('cricket_matches', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      match_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      team1_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'teams',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      team2_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'teams',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      toss_winner_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'teams',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      toss_decision: {
        type: Sequelize.ENUM('bat', 'bowl'),
        allowNull: true
      },
      venue: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      match_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      overs: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 20
      },
      status: {
        type: Sequelize.ENUM('upcoming', 'live', 'innings_break', 'completed', 'abandoned'),
        allowNull: false,
        defaultValue: 'upcoming'
      },
      current_innings: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      batting_team_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'teams',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      winner_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'teams',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      result_summary: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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

    // Create innings_scores table
    await queryInterface.createTable('innings_scores', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      match_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'cricket_matches',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      innings_number: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      batting_team_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'teams',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      bowling_team_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'teams',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      total_runs: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      wickets: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      overs_bowled: {
        type: Sequelize.DECIMAL(4, 1),
        allowNull: false,
        defaultValue: 0.0
      },
      extras: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      wides: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      no_balls: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      byes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      leg_byes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      is_completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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

    // Create ball_by_ball table for detailed scoring
    await queryInterface.createTable('ball_by_ball', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      innings_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'innings_scores',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      over_number: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      ball_number: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      batsman_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'players',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      bowler_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'players',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      runs_scored: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      ball_type: {
        type: Sequelize.ENUM('normal', 'wide', 'no_ball', 'bye', 'leg_bye', 'wicket'),
        allowNull: false,
        defaultValue: 'normal'
      },
      is_boundary: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      is_six: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      is_wicket: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      wicket_type: {
        type: Sequelize.ENUM('bowled', 'caught', 'lbw', 'run_out', 'stumped', 'hit_wicket', 'retired'),
        allowNull: true
      },
      fielder_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'players',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      dismissed_batsman_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'players',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      commentary: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create indexes
    await queryInterface.addIndex('cricket_matches', ['status']);
    await queryInterface.addIndex('cricket_matches', ['match_date']);
    await queryInterface.addIndex('cricket_matches', ['team1_id', 'team2_id']);
    
    await queryInterface.addIndex('innings_scores', ['match_id']);
    await queryInterface.addIndex('innings_scores', ['batting_team_id']);
    await queryInterface.addIndex('innings_scores', ['match_id', 'innings_number'], {
      unique: true,
      name: 'unique_match_innings'
    });

    await queryInterface.addIndex('ball_by_ball', ['innings_id']);
    await queryInterface.addIndex('ball_by_ball', ['innings_id', 'over_number', 'ball_number'], {
      name: 'idx_ball_sequence'
    });
    await queryInterface.addIndex('ball_by_ball', ['batsman_id']);
    await queryInterface.addIndex('ball_by_ball', ['bowler_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ball_by_ball');
    await queryInterface.dropTable('innings_scores');
    await queryInterface.dropTable('cricket_matches');
  }
};
