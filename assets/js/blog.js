/* ===================================
   BLOG PAGE JAVASCRIPT
   =================================== */

document.addEventListener('DOMContentLoaded', function () {
    const blogContainer = document.getElementById('blog-container');

    // Function to get translated text
    function t(key) {
        if (window.i18n) {
            return window.i18n.get(key);
        }
        return key;
    }

    // Show loading state
    blogContainer.innerHTML = `<div class="blog-loading">${t('blog.loading')}</div>`;

    // Function to fetch blog posts from the backend API
    async function fetchBlogPosts() {
        try {
            console.log('Fetching blog posts from API...');

            const response = await fetch('/api/blog', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors'
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('API response:', data);

            if (!data.success) {
                throw new Error(data.error || 'Failed to load blog posts');
            }

            return data.posts;

        } catch (error) {
            console.error('Error fetching blog posts:', error);
            throw error;
        }
    }

    // Function to load and render blog posts
    async function loadBlog() {
        try {
            const posts = await fetchBlogPosts();

            if (posts.length === 0) {
                // Show empty state if no posts
                blogContainer.innerHTML = `
          <div class="blog-empty">
            <h2>${t('blog.noPosts')}</h2>
            <p>${t('blog.checkBack')}</p>
          </div>
        `;
                return;
            }

            // Render the blog posts
            renderBlogPosts(posts);

        } catch (error) {
            // Show error message
            blogContainer.innerHTML = `
        <div class="blog-loading">
          <p>Error loading blog posts.</p>
          <p>Please check that the server is running and try refreshing the page.</p>
          <p>Error: ${error.message}</p>
        </div>
      `;
        }
    }

    // Function to render blog posts
    function renderBlogPosts(posts) {
        // Sort posts by date (most recent first)
        posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Clear loading state
        blogContainer.innerHTML = '';

        // Add posts to container
        posts.forEach((post) => {
            const postElement = createBlogPost(post);
            blogContainer.appendChild(postElement);
        });

        // Update page title with post count
        const title = document.querySelector('title');
        if (title) {
            title.textContent = `Blog (${posts.length} posts) | Petras Music Atelier`;
        }
    }

    // Function to create blog post element
    function createBlogPost(postData) {
        const post = document.createElement('article');
        post.className = 'blog-post';
        post.setAttribute('data-id', postData.id);

        let mediaHtml = '';

        // Add featured image if exists
        if (postData.image) {
            mediaHtml += `<img src="${postData.image}" alt="${escapeHtml(postData.title)}" class="blog-post-image">`;
        }

        // Add featured video if exists
        if (postData.video) {
            mediaHtml += `<video src="${postData.video}" controls class="blog-post-video"></video>`;
        }

        // Add embedded video if exists (don't escape HTML here - we want the iframe to render)
        if (postData.embedded_video) {
            // If it's a YouTube URL, convert to embed format
            let embedCode = postData.embedded_video;

            // Check if it's a YouTube URL
            const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/;
            const match = postData.embedded_video.match(youtubeRegex);

            if (match) {
                const videoId = match[1];
                embedCode = `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
            }

            mediaHtml += `<div class="blog-post-embedded-video">${embedCode}</div>`;
        }

        // Format date
        const formattedDate = formatDate(postData.created_at);

        // Create HTML with support for rich text content
        let contentHtml = postData.content;

        // If content contains HTML (like iframes, links, etc.), use it as-is
        // Otherwise, convert plain text with newlines to paragraphs
        if (contentHtml && !contentHtml.includes('<') && !contentHtml.includes('&lt;')) {
            // Plain text - convert newlines to paragraphs
            contentHtml = contentHtml.split('\n\n')
                .filter(para => para.trim())
                .map(para => `<p>${para.trim()}</p>`)
                .join('');
        }

        post.innerHTML = `
      <h2 class="blog-post-title">${escapeHtml(postData.title)}</h2>
      <div class="blog-post-date">${formattedDate}</div>
      ${mediaHtml}
      <div class="blog-post-content">${contentHtml}</div>
    `;

        return post;
    }

    // Function to format date
    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return date.toLocaleDateString('en-US', options);
    }

    // Function to escape HTML
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    // Start loading blog
    loadBlog();

    // Function to refresh blog (for future use)
    window.refreshBlog = function () {
        loadBlog();
    };
});

