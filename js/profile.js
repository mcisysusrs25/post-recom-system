 // Check authentication
 const token = sessionStorage.getItem('token');
 if (!token) {
     window.location.href = 'auth.html';
 }

 // Tab Navigation
 const dashboardTab = document.getElementById('dashboard-tab');
 const profileTab = document.getElementById('profile-tab');
 const dashboardBtn = document.getElementById('dashboard-btn');
 const logoutBtn = document.getElementById('logout-btn');

 // Navigation events
 dashboardTab.addEventListener('click', () => {
     window.location.href = 'dashboard.html';
 });

 dashboardBtn.addEventListener('click', () => {
     window.location.href = 'dashboard.html';
 });

 logoutBtn.addEventListener('click', () => {
     sessionStorage.removeItem('token');
     window.location.href = 'auth.html';
 });

 // Tag management function
 function setupTagInput(inputId, containerId) {
     const input = document.getElementById(inputId);
     const container = document.getElementById(containerId);
     const tags = [];

     // Render tags
     function renderTags() {
         container.innerHTML = tags.map((tag, index) => 
             `<span class="tag">
                 ${tag}
                 <button type="button" class="tag-remove" onclick="removeTag('${index}', '${containerId}')">×</button>
             </span>`
         ).join('');
     }

     // Add tag
     function addTag(tag) {
         const trimmedTag = tag.trim();
         if (trimmedTag && !tags.includes(trimmedTag)) {
             tags.push(trimmedTag);
             renderTags();
             input.value = ''; // Clear input
         }
     }

     // Remove tag
     window[`removeTag_${containerId}`] = function(index) {
         tags.splice(index, 1);
         renderTags();
     };

     // Event listener for adding tags
     input.addEventListener('keydown', (e) => {
         if (e.key === 'Enter' || e.key === ',') {
             e.preventDefault();
             addTag(input.value);
         }
     });

     // Return methods to interact with tags
     return {
         addTag,
         getTags: () => [...tags],
         setTags: (newTags) => {
             tags.length = 0; // Clear existing tags
             newTags.forEach(tag => tags.push(tag));
             renderTags();
         }
     };
 }

 // Modify the removeTag function to use dynamic function names
 window.removeTag = function(index, containerId) {
     window[`removeTag_${containerId}`](index);
 };

 // Setup tag inputs
 const createFeedPreferences = setupTagInput('feed-preferences-input', 'feed-preferences-container');
 const createSkills = setupTagInput('skills-input', 'skills-container');
 const editFeedPreferences = setupTagInput('edit-feed-preferences-input', 'edit-feed-preferences-container');
 const editSkills = setupTagInput('edit-skills-input', 'edit-skills-container');

 // DOM Elements
 const createProfileForm = document.getElementById('create-profile-form');
 const editProfileForm = document.getElementById('edit-profile-form');
 const noProfileSection = document.getElementById('no-profile-section');
 const profileSection = document.getElementById('profile-section');
 const editProfileSection = document.getElementById('edit-profile-section');
 const editProfileBtn = document.getElementById('edit-profile-btn');
 const cancelEditBtn = document.getElementById('cancel-edit-btn');

 // Create profile submission
 createProfileForm.addEventListener('submit', async (e) => {
     e.preventDefault();
     
     const profileData = {
         name: document.getElementById('name').value,
         age: parseInt(document.getElementById('age').value),
         occupation: document.getElementById('occupation').value,
         feedPreferences: createFeedPreferences.getTags(),
         skills: createSkills.getTags()
     };

     try {
         const response = await fetch('http://127.0.0.1:5000/api/profiles/', {
             method: 'POST',
             headers: {
                 'Content-Type': 'application/json',
                 'x-auth-token': token
             },
             body: JSON.stringify(profileData)
         });

         if (response.ok) {
             // Hide create profile, show profile details
             noProfileSection.style.display = 'none';
             profileSection.style.display = 'block';
             
             // Fetch and display profile
             fetchProfile();
         } else {
             const errorData = await response.json();
             alert(errorData.message || 'Failed to create profile');
         }
     } catch (error) {
         console.error('Error:', error);
         alert('Network error. Please try again.');
     }
 });

 // Fetch profile
 async function fetchProfile() {
     try {
         const response = await fetch('http://127.0.0.1:5000/api/profiles/me', {
             method: 'GET',
             headers: {
                 'x-auth-token': token
             }
         });

         if (!response.ok) {
             // No profile exists
             noProfileSection.style.display = 'block';
             profileSection.style.display = 'none';
             editProfileSection.style.display = 'none';
             return;
         }

         const profile = await response.json();
         
         // Display profile details
         document.getElementById('view-name').textContent = profile.name || 'N/A';
         document.getElementById('view-age').textContent = profile.age || 'N/A';
         document.getElementById('view-occupation').textContent = profile.occupation || 'N/A';

         // Display feed preferences
         const viewFeedPreferences = document.getElementById('view-feed-preferences');
         viewFeedPreferences.innerHTML = (profile.feedPreferences || []).map(pref => 
             `<span class="tag">${pref}</span>`
         ).join('');

         // Display skills
         const viewSkills = document.getElementById('view-skills');
         viewSkills.innerHTML = (profile.skills || []).map(skill => 
             `<span class="tag">${skill}</span>`
         ).join('');

         // Switch to profile view
         noProfileSection.style.display = 'none';
         profileSection.style.display = 'block';
         editProfileSection.style.display = 'none';
     } catch (error) {
         console.error('Error:', error);
         alert('Failed to fetch profile');
     }
 }

 // Edit profile button
 editProfileBtn.addEventListener('click', async () => {
     try {
         const response = await fetch('http://127.0.0.1:5000/api/profiles/me', {
             method: 'GET',
             headers: {
                 'x-auth-token': token
             }
         });

         const profile = await response.json();

         // Populate edit form
         document.getElementById('edit-name').value = profile.name;
         document.getElementById('edit-age').value = profile.age;
         document.getElementById('edit-occupation').value = profile.occupation;
         
         // Set tags
         editFeedPreferences.setTags(profile.feedPreferences || []);
         editSkills.setTags(profile.skills || []);

         // Switch to edit view
         profileSection.style.display = 'none';
         editProfileSection.style.display = 'block';
     } catch (error) {
         console.error('Error:', error);
         alert('Failed to load profile for editing');
     }
 });

 // Edit profile submission
 editProfileForm.addEventListener('submit', async (e) => {
     e.preventDefault();
     
     const profileData = {
         name: document.getElementById('edit-name').value,
         age: parseInt(document.getElementById('edit-age').value),
         occupation: document.getElementById('edit-occupation').value,
         feedPreferences: editFeedPreferences.getTags(),
         skills: editSkills.getTags()
     };

     try {
         const response = await fetch('http://127.0.0.1:5000/api/profiles/', {
             method: 'PUT',
             headers: {
                 'Content-Type': 'application/json',
                 'x-auth-token': token
             },
             body: JSON.stringify(profileData)
         });

         if (response.ok) {
             // Refresh profile view
             fetchProfile();
             
             // Switch back to view mode
             profileSection.style.display = 'block';
             editProfileSection.style.display = 'none';
         } else {
             const errorData = await response.json();
             alert(errorData.message || 'Failed to update profile');
         }
     } catch (error) {
         console.error('Error:', error);
         alert('Network error. Please try again.');
     }
 });

 // Cancel edit
 cancelEditBtn.addEventListener('click', () => {
     profileSection.style.display = 'block';
     editProfileSection.style.display = 'none';
 });

 // Initial profile fetch
 fetchProfile();