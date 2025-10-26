// Simple admin login and gallery admin JS
const loginForm = document.getElementById('loginForm');
const adminPassword = document.getElementById('adminPassword');
const loginError = document.getElementById('loginError');
const adminPanel = document.getElementById('adminPanel');
const galleryAdmin = document.getElementById('galleryAdmin');
const blogAdmin = document.getElementById('blogAdmin');
const logoutBtn = document.getElementById('logoutBtn');

function showPanel() {
    loginForm.style.display = 'none';
    adminPanel.style.display = '';
    adminPanel.classList.add('active');
    loadGalleryAdmin();
    loadBlogAdmin();
}
function showLogin() {
    loginForm.style.display = '';
    adminPanel.style.display = 'none';
    adminPanel.classList.remove('active');
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';
    const password = adminPassword.value;
    const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (data.success) {
        showPanel();
    } else {
        loginError.textContent = data.error || 'Login failed';
    }
});

logoutBtn.addEventListener('click', async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    adminPassword.value = '';
    showLogin();
});

async function checkAuth() {
    const res = await fetch('/api/admin/check');
    const data = await res.json();
    if (data.authenticated) {
        showPanel();
    } else {
        showLogin();
    }
}

// Tab switching
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', function () {
        document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        const tabName = this.getAttribute('data-tab');
        document.getElementById(tabName + 'Tab').classList.add('active');
    });
});

async function loadGalleryAdmin() {
    galleryAdmin.innerHTML = '<em>Loading images...</em>';
    const res = await fetch('/api/gallery');
    const data = await res.json();
    if (!data.success) {
        galleryAdmin.innerHTML = '<span style="color:#b00">Failed to load images</span>';
        return;
    }
    galleryAdmin.innerHTML = `
    <table class="admin-gallery-table">
      <thead><tr><th>Preview</th><th>Description</th><th>Actions</th></tr></thead>
      <tbody>
        ${data.images.map(img => `
          <tr data-id="${img.id}">
            <td><img src="${img.src}" alt="" /></td>
            <td><input type="text" value="${escapeHtml(img.description || '')}" class="desc-input" /></td>
            <td>
              <button class="save-btn">Save</button>
              <button class="delete-btn">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
    // Save and delete handlers
    document.querySelectorAll('.save-btn').forEach(btn => {
        btn.addEventListener('click', async function () {
            const tr = this.closest('tr');
            const id = tr.getAttribute('data-id');
            const desc = tr.querySelector('.desc-input').value;
            await fetch(`/api/admin/images/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: desc })
            });
            loadGalleryAdmin();
        });
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async function () {
            if (!confirm('Delete this image?')) return;
            const tr = this.closest('tr');
            const id = tr.getAttribute('data-id');
            await fetch(`/api/admin/images/${id}`, { method: 'DELETE' });
            loadGalleryAdmin();
        });
    });
}

async function loadBlogAdmin() {
    const res = await fetch('/api/blog');
    const data = await res.json();
    if (!data.success || data.posts.length === 0) {
        blogAdmin.innerHTML = '<p style="color: var(--ruby); font-family: Montserrat;">No blog posts yet.</p>';
        return;
    }
    blogAdmin.innerHTML = `
        <div class="blog-posts-list">
            ${data.posts.map(post => `
                <div class="blog-post-item" data-id="${post.id}">
                    <h3>${escapeHtml(post.title)}</h3>
                    <p>${new Date(post.created_at).toLocaleDateString()}</p>
                    <button class="delete-blog-btn" data-id="${post.id}">Delete</button>
                </div>
            `).join('')}
        </div>
    `;

    // Delete blog post handlers
    document.querySelectorAll('.delete-blog-btn').forEach(btn => {
        btn.addEventListener('click', async function () {
            if (!confirm('Delete this blog post?')) return;
            const id = this.getAttribute('data-id');
            await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' });
            loadBlogAdmin();
        });
    });
}

// Upload handler
const uploadForm = document.getElementById('uploadForm');
if (uploadForm) {
    uploadForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const file = document.getElementById('uploadImage').files[0];
        const desc = document.getElementById('uploadDesc').value;
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        formData.append('description', desc);
        await fetch('/api/admin/images', {
            method: 'POST',
            body: formData
        });
        uploadForm.reset();
        loadGalleryAdmin();
    });
}

// Blog form handler
const blogForm = document.getElementById('blogForm');
if (blogForm) {
    blogForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const title = document.getElementById('blogTitle').value;
        const content = document.getElementById('blogContent').value;
        const imageFile = document.getElementById('blogImage').files[0];
        const videoFile = document.getElementById('blogVideo').files[0];
        const embedded = document.getElementById('blogEmbedded').value;

        if (!title || !content) {
            alert('Title and content are required!');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        if (imageFile) formData.append('image', imageFile);
        if (videoFile) formData.append('video', videoFile);
        if (embedded) formData.append('embedded_video', embedded);

        try {
            const res = await fetch('/api/admin/blog', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                blogForm.reset();
                loadBlogAdmin();
            } else {
                alert('Error: ' + (data.error || 'Failed to create post'));
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// On page load, show login form by default
showLogin();

checkAuth();
