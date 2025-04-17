// Check if user is authenticated
const token = sessionStorage.getItem('token');
if (!token) {
    window.location.href = 'auth.html';
}

// Navigation events
const dashboardTab = document.getElementById('dashboard-tab');
const profileTab = document.getElementById('profile-tab');
const dashboardBtn = document.getElementById('dashboard-btn');
const logoutBtn = document.getElementById('logout-btn');
const backBtn = document.getElementById('back-btn');

// Navigation event listeners
dashboardTab.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
});

profileTab.addEventListener('click', () => {
    window.location.href = 'profile.html';
});

dashboardBtn.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
});

backBtn.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
});

logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('token');
    window.location.href = 'auth.html';
});

// Get post ID from URL
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');

const postTitle = document.getElementById('post-title');
const postDescription = document.getElementById('post-description');
const postTagsContainer = document.getElementById('post-tags-container');
const likeCount = document.getElementById('like-count');
const likeBtn = document.getElementById('like-btn');
const postAuthor = document.getElementById('post-author');
const postDate = document.getElementById('post-date');

// Format date
function formatDate(dateString) {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Fetch post details
async function fetchPostDetails() {
    try {
        const response = await fetch(`http://127.0.0.1:5000/api/posts/${postId}`, {
            method: 'GET',
            headers: {
                'x-auth-token': token
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch post details');
        }

        const post = await response.json();

        // Update post details
        postTitle.textContent = post.title;
        postDescription.textContent = post.description;
        
        // Update author and date if available
        if (post.author && post.author.name) {
            postAuthor.textContent = `Posted by: ${post.author.name}`;
        }
        
        postDate.textContent = `Date: ${formatDate(post.date)}`;
        
        // Render tags
        postTagsContainer.innerHTML = post.tags.map(tag => 
            `<span class="post-tag"># ${tag}</span>`
        ).join('');

        // Update like count with proper formatting
        const likes = post.likes || 0;
        likeCount.innerHTML = `<i class="fas fa-thumbs-up"></i><span>${likes} ${likes === 1 ? 'Like' : 'Likes'}</span>`;

        // Mark post as viewed
        await fetch(`http://127.0.0.1:5000/api/posts/${postId}/view`, {
            method: 'POST',
            headers: {
                'x-auth-token': token
            }
        });
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load post details');
    }
}

// Like post
likeBtn.addEventListener('click', async () => {
    try {
        const response = await fetch(`http://127.0.0.1:5000/api/posts/${postId}/like`, {
            method: 'POST',
            headers: {
                'x-auth-token': token
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to like post');
        }

        // Refresh post details after liking
        fetchPostDetails();
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Failed to like post');
    }
});

// Initial fetch of post details
fetchPostDetails();