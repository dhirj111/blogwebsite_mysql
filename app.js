const express = require('express');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const cors = require('cors');
const path = require('path');
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'views')));
app.set('views', 'views');
// Database Connection
const sequelize = new Sequelize('node-complete', 'root', '1@Password', {
  dialect: 'mysql',
  host: 'localhost',
});

// Model Definitions
const Post = sequelize.define('post', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  author: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
});

const Comment = sequelize.define('comment', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  comment: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  username: {
    type: Sequelize.STRING,
    defaultValue: 'Anonymous',
  },
});

// Associations
Post.hasMany(Comment, { onDelete: 'CASCADE' });
Comment.belongsTo(Post);

// Sync Models

// Routes

// Add a new post
app.post('/addPost', async (req, res) => {
  const { title, author, description } = req.body;
  try {
    const post = await Post.create({ title, author, description });
    res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Get all posts
app.get('/getPosts', async (req, res) => {
  try {
    const posts = await Post.findAll();
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get a specific post with comments
app.get('/getPost/:postId', async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Post.findByPk(postId, {
      include: [Comment],
    });
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    res.status(200).json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Add a comment to a post
app.post('/addComment', async (req, res) => {
  const { postId, comment, username } = req.body;
  try {
    const post = await Post.findByPk(postId);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    const newComment = await Comment.create({ comment, username, postId });
    res.status(201).json({ message: 'Comment added successfully', newComment });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});
app.get('/', (req, res, next) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
})

// Start the server
sequelize
  .sync()
  .then(() => {
    app.listen(7000, () => {
      console.log('Server is running on http://localhost:7000');
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });
