// index.js
const express = require('express');
const cors = require('cors');
const { sequelize, User, Follow, Activity, Notification } = require('./models');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize DB and seed users
app.get('/init', async (req, res) => {
  await sequelize.sync({ force: true });
  // Seed users
  const users = await User.bulkCreate([
    { name: 'Alice' },
    { name: 'Bob' },
    { name: 'Charlie' },
  ]);
  res.json(users);
});

// Get all users
app.get('/users', async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

// Follow a user
app.post('/follow', async (req, res) => {
  const { followerId, followeeId } = req.body;
  if (followerId === followeeId) return res.status(400).json({ error: "Can't follow self" });

  // Check if already following
  const existingFollow = await Follow.findOne({ where: { followerId, followeeId } });
  if (existingFollow) {
    return res.status(400).json({ error: "Already following this user" });
  }

  await Follow.create({ followerId, followeeId });
  const follower = await User.findByPk(followerId); // Get the follower's name
  // Create activity
  const activity = await Activity.create({
    userId: followerId,
    type: 'follow',
    content: `${follower.name} followed User ${followeeId}`,
  });
  // Notify followee
  await Notification.create({
    userId: followeeId,
    activityId: activity.id,
    content: `You have a new follower: ${follower.name}!`,
  });
  res.json({ success: true });
});

// Unfollow a user
app.post('/unfollow', async (req, res) => {
  const { followerId, followeeId } = req.body;
  if (followerId === followeeId) return res.status(400).json({ error: "Can't unfollow self" });

  const follow = await Follow.findOne({ where: { followerId, followeeId } });
  if (!follow) {
    return res.status(400).json({ error: "Not following this user" });
  }

  await follow.destroy();
  const follower = await User.findByPk(followerId);
  // Create activity
  const activity = await Activity.create({
    userId: followerId,
    type: 'unfollow',
    content: `${follower.name} unfollowed User ${followeeId}`,
  });
  // Notify followee
  await Notification.create({
    userId: followeeId,
    activityId: activity.id,
    content: `${follower.name} unfollowed you`,
  });
  res.json({ success: true });
});

// Post a blog
app.post('/blog', async (req, res) => {
  const { userId, content } = req.body;
  const user = await User.findByPk(userId); // Get the user object
  const activity = await Activity.create({
    userId,
    type: 'blog',
    content,
  });
  // Notify all followers
  const followers = await Follow.findAll({ where: { followeeId: userId } });
  for (const f of followers) {
    await Notification.create({
      userId: f.followerId,
      activityId: activity.id,
      content: `${user.name} posted a new blog: ${content}`,
    });
  }
  res.json({ success: true });
});

// Post a comment
app.post('/comment', async (req, res) => {
  const { userId, content } = req.body;
  const user = await User.findByPk(userId); // Get the user object
  const activity = await Activity.create({
    userId,
    type: 'comment',
    content,
  });
  // Notify all followers
  const followers = await Follow.findAll({ where: { followeeId: userId } });
  for (const f of followers) {
    await Notification.create({
      userId: f.followerId,
      activityId: activity.id,
      content: `${user.name} commented: ${content}`,
    });
  }
  res.json({ success: true });
});

// Get notifications for a user
app.get('/notifications/:userId', async (req, res) => {
  const { userId } = req.params;
  const notifications = await Notification.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
  });
  res.json(notifications);
});

// Get list of users that a user is following
app.get('/following/:userId', async (req, res) => {
  const { userId } = req.params;
  const follows = await Follow.findAll({
    where: { followerId: userId },
    attributes: ['followeeId'],
  });
  res.json(follows.map(f => f.followeeId));
});

const PORT = process.env.PORT || 4000;

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));