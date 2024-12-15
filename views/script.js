document.addEventListener('DOMContentLoaded', () => {
  fetchPosts();

  window.submitPost = submitPost;
  window.viewPost = viewPost;
  window.submitComment = submitComment;

  function submitPost(event) {
    event.preventDefault();
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const description = document.getElementById('description').value;

    axios.post('http://localhost:7000/addPost', { title:title, author:author, description:description })
      .then(() => {
        alert('Post submitted successfully');
        fetchPosts();
      })
      .catch(err => {
        console.error('Error submitting post:', err);
      });
  }

  function fetchPosts() {
    axios.get('http://localhost:7000/getPosts')
      .then(response => {
        displayPosts(response.data);
      })
      .catch(err => {
        console.error('Error fetching posts:', err);
      });
  }

  function displayPosts(posts) {
    const postsContainer = document.getElementById('postsContainer');
    postsContainer.innerHTML = '';

    posts.forEach(post => {
      const postDiv = document.createElement('div');
      postDiv.innerHTML = `
        <h2 onclick="viewPost(${post.id})">${post.title}</h2>
      `;
      postsContainer.appendChild(postDiv);
    });
  }

  function viewPost(postId) {
    axios.get(`http://localhost:7000/getPosts`)
      .then(response => {
        const post = response.data.find(p => p.id === postId);
        const postsContainer = document.getElementById('postsContainer');
        postsContainer.innerHTML = `
          <h2>${post.title}</h2>
          <h3>By: ${post.author}</h3>
          <p>${post.description}</p>
          <h4>Comments</h4>
          <div id="commentsContainer"></div>
          <input id="commentInput" placeholder="Add a comment">
          <button onclick="submitComment(${postId})">Submit</button>
        `;
        fetchComments(postId);
      })
      .catch(err => {
        console.error('Error fetching post details:', err);
      });
  }

  function submitComment(postId) {
    const commentInput = document.getElementById('commentInput');
    const comment = commentInput.value;

    if (!comment.trim()) {
      alert('Comment cannot be empty');
      return;
    }

    axios.post('http://localhost:7000/addComment', { postId:postId, comment:comment })
      .then(() => {
        commentInput.value = '';
        fetchComments(postId);
      })
      .catch(err => {
        console.error('Error submitting comment:', err);
      });
  }

  function fetchComments(postId) {
    axios.get(`http://localhost:7000/getComments/${postId}`)
      .then(response => {
        const commentsContainer = document.getElementById('commentsContainer');
        commentsContainer.innerHTML = response.data
          .map(comment => `<p>${comment.text}</p>`)
          .join('');
      })
      .catch(err => {
        console.error('Error fetching comments:', err);
      });
  }
});
