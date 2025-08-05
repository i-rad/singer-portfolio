// Simple admin login and gallery admin JS
const loginForm = document.getElementById('loginForm');
const adminPassword = document.getElementById('adminPassword');
const loginError = document.getElementById('loginError');
const adminPanel = document.getElementById('adminPanel');
const galleryAdmin = document.getElementById('galleryAdmin');
const logoutBtn = document.getElementById('logoutBtn');

function showPanel() {
    loginForm.style.display = 'none';
    adminPanel.style.display = '';
    adminPanel.classList.add('active');
    loadGalleryAdmin();
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
            <td><input type="text" value="${img.description || ''}" class="desc-input" /></td>
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

// On page load, show login form by default
showLogin();

checkAuth();
