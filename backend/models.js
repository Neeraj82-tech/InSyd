// models.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('sqlite:insyd.db');

// User model
const User = sequelize.define('User', {
  name: DataTypes.STRING,
});

// Follow model
const Follow = sequelize.define('Follow', {
  followerId: DataTypes.INTEGER,
  followeeId: DataTypes.INTEGER,
});

// Activity model
const Activity = sequelize.define('Activity', {
  userId: DataTypes.INTEGER,
  type: DataTypes.STRING, // 'blog', 'comment', 'follow'
  content: DataTypes.STRING,
});

// Notification model
const Notification = sequelize.define('Notification', {
  userId: DataTypes.INTEGER,
  activityId: DataTypes.INTEGER,
  content: DataTypes.STRING,
});

module.exports = { sequelize, User, Follow, Activity, Notification };