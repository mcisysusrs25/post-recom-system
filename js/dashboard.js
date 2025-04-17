 // Check if user is authenticated
 const token = sessionStorage.getItem('token');
 if (!token) {
     window.location.href = 'index.html';
 }

 const postsContainer = document.getElementById('posts-container');
 const postForm = document.getElementById('post-form');
 const toggleCreatePostBtn = document.getElementById('toggle-create-post');
 const cancelPostBtn = document.getElementById('cancel-post');
 const logoutBtn = document.getElementById('logout-btn');
 const profileBtn = document.getElementById('profile-btn');
 const refreshBtn = document.getElementById('refresh-posts');

 // Toggle create post form
 toggleCreatePostBtn.addEventListener('click', () => {
     postForm.classList.toggle('active');
 });

 // Cancel post creation
 cancelPostBtn.addEventListener('click', () => {
     postForm.classList.remove('active');
     postForm.reset();
 });

 // Logout functionality
 logoutBtn.addEventListener('click', () => {
     sessionStorage.removeItem('token');
     window.location.href = 'index.html';
 });

 // Profile button
 profileBtn.addEventListener('click', () => {
     window.location.href = 'profile.html';
 });

 // Refresh button event listener
 refreshBtn.addEventListener('click', () => {
     showLoading();
     fetchPosts();
 });

 // Helper function to format date
 function formatDate(dateString) {
     const date = new Date(dateString || Date.now());
     return date.toLocaleDateString('en-US', {
         month: 'short',
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit'
     });
 }

 // Get first letter of a name
 function getInitials(name) {
     return name ? name.charAt(0).toUpperCase() : 'U';
 }

 // Show loading animation
 function showLoading() {
     postsContainer.innerHTML = `
         <div class="loading-container">
             <div class="spinner"></div>
             <div class="loading-text">Finding the best recommended posts for you...</div>
         </div>
     `;
 }

 // Fetch and render posts
 async function fetchPosts() {
     try {
         const response = await fetch('http://127.0.0.1:5000/api/posts/', {
             method: 'GET',
             headers: {
                 'Content-Type': 'application/json',
                 'x-auth-token': token
             }
         });

         if (!response.ok) {
             const errorText = await response.text();
             throw new Error(`Server responded with ${response.status}: ${errorText}`);
         }

         const posts = await response.json();

         // Update post count display
         const postCountDisplay = document.getElementById('post-count-display');
         postCountDisplay.textContent = posts.length > 0 ? `(${posts.length} posts)` : '(No posts)';

         if (!posts || posts.length === 0) {
             postsContainer.innerHTML = `
                 <div class="no-posts">
                     <p>No posts available. Create your first post!</p>
                 </div>
             `;
             return;
         }

         postsContainer.innerHTML = posts.map(post => `
             <div class="post-card" id="post-${post._id}">
                 <div class="post-header">
                     <div class="post-author">
                         <div class="author-avatar">
                             <i class="fas fa-user"></i>
                         </div>
                         <div class="author-info">
                             <span class="author-name">${post.author?.name || 'User'}</span>
                             <span class="post-time">${formatDate(post.date)}</span>
                         </div>
                     </div>
                 </div>
                 <div class="post-content">
                     <h3>${post.title}</h3>
                     <p>${post.description}</p>
                     <div class="post-tags">
                         ${post.tags.map(tag => `<span class="post-tag"># ${tag}</span>`).join('')}
                     </div>
                 </div>
                 <div class="post-actions">
                     <div class="likes-count" id="likes-${post._id}">
                         <i class="fas fa-thumbs-up"></i>
                         ${post.likes || 0} Likes
                     </div>
                     <div class="action-buttons">
                         <button onclick="likePost('${post._id}')" class="action-btn">
                             <i class="far fa-thumbs-up"></i>
                             <span>Like</span>
                         </button>
                         <button onclick="viewPostDetails('${post._id}')" class="action-btn">
                             <i class="far fa-comment"></i>
                             <span>Details</span>
                         </button>
                     </div>
                 </div>
             </div>
         `).join('');

     } catch (error) {
         console.error('Error fetching posts:', error);
         postsContainer.innerHTML = `
             <div class="no-posts">
                 <p>Failed to load posts. Please try again later.</p>
             </div>
         `;
     }
 }

 // Tag Management
 const tagInputContainer = document.getElementById('tag-input-container');
 const tagInput = document.getElementById('tag-input');
 let tags = [];

 // Function to create a tag chip
 function createTagChip(tagText) {
     const chipContainer = document.createElement('div');
     chipContainer.className = 'tag-chip';

     const tagSpan = document.createElement('span');
     tagSpan.textContent = tagText;

     const removeBtn = document.createElement('button');
     removeBtn.textContent = '×';
     removeBtn.className = 'tag-chip-remove';
     removeBtn.addEventListener('click', () => {
         tags = tags.filter(t => t !== tagText);
         chipContainer.remove();
     });

     chipContainer.appendChild(tagSpan);
     chipContainer.appendChild(removeBtn);

     return chipContainer;
 }

 // Tag input event listener
 tagInput.addEventListener('keydown', (e) => {
     if (e.key === 'Enter' || e.key === ',') {
         e.preventDefault();
         const tagText = tagInput.value.trim();

         if (tagText && !tags.includes(tagText)) {
             tags.push(tagText);
             const tagChip = createTagChip(tagText);
             tagInputContainer.insertBefore(tagChip, tagInput);
             tagInput.value = '';
         }
     }
 });

 // Create post
 postForm.addEventListener('submit', async (e) => {
     e.preventDefault();
     const title = document.getElementById('post-title').value;
     const description = document.getElementById('post-description').value;

     try {
         const response = await fetch('http://127.0.0.1:5000/api/posts/', {
             method: 'POST',
             headers: {
                 'Content-Type': 'application/json',
                 'x-auth-token': token
             },
             body: JSON.stringify({ title, description, tags })
         });

         if (response.ok) {
             // Clear form and hide it
             postForm.reset();
             postForm.classList.remove('active');

             // Remove existing tag chips
             const existingChips = tagInputContainer.querySelectorAll('.tag-chip');
             existingChips.forEach(chip => chip.remove());
             tags = []; // Reset tags

             // Show loading and refresh posts
             showLoading();
             fetchPosts();
         } else {
             const errorData = await response.json();
             alert(errorData.message || 'Failed to create post');
         }
     } catch (error) {
         console.error('Error creating post:', error);
         alert('Network error. Please try again.');
     }
 });

 // Like post function without page refresh
 async function likePost(postId) {
     try {
         const response = await fetch(`http://127.0.0.1:5000/api/posts/${postId}/like`, {
             method: 'POST',
             headers: {
                 'x-auth-token': token
             }
         });

         if (response.ok) {
             // Update like count without refreshing entire page
             const data = await response.json();
             const likesElement = document.getElementById(`likes-${postId}`);
             if (likesElement) {
                 likesElement.innerHTML = `
                     <i class="fas fa-thumbs-up"></i>
                     ${data.likes || 0} Likes
                 `;
             }
         } else {
             const errorData = await response.json();
             alert(errorData.message || 'Failed to like post');
         }
     } catch (error) {
         console.error('Error liking post:', error);
         alert('Network error. Please try again.');
     }
 }

 // View post details
 function viewPostDetails(postId) {
     window.location.href = `postDetails.html?id=${postId}`;
 }

 // Show loading on initial load
 showLoading();

 // Initial fetch of posts
 fetchPosts();