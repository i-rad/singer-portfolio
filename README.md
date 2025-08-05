# Singer Portfolio Website

A beautiful, responsive portfolio website for singers with a dynamic gallery system.

## Features

- 🎵 **Full-screen hero section** with singer background image
- 🎨 **Collage-style gallery preview** on home page
- 📸 **Dynamic gallery page** that automatically loads images
- 📱 **Fully responsive** design for all devices
- 🎭 **Music-themed animations** (sound waves, microphone pulse)
- 📞 **Floating contact bar** with social media links
- 🎨 **Sugar & Stories color palette** for elegant design

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Styling**: Custom CSS with CSS Grid and Flexbox
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Cormorant Garamond, Montserrat)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Add Your Images

Place your images in the `images/` folder. The system supports:
- **Formats**: JPG, JPEG, PNG, GIF, WebP
- **Naming**: Any filename will work!
- **Examples**: `1.jpg`, `concert.jpg`, `my-performance.png`, etc.

### 3. Start the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

### 4. Access Your Website

- **Home Page**: `http://localhost:3000`
- **Gallery Page**: `http://localhost:3000/gallery.html`
- **API Endpoint**: `http://localhost:3000/api/gallery`

## File Structure

```
├── index.html              # Home page
├── gallery.html            # Gallery page
├── server.js               # Express backend server
├── package.json            # Dependencies and scripts
├── README.md               # This file
├── assets/
│   ├── css/
│   │   ├── main.css        # Base styles and variables
│   │   ├── components.css  # Component-specific styles
│   │   ├── responsive.css  # Mobile responsive styles
│   │   └── gallery.css     # Gallery page styles
│   └── js/
│       ├── main.js         # Main JavaScript functionality
│       └── gallery.js      # Gallery page JavaScript
└── images/                 # Your image files go here
    ├── 1.jpg
    ├── 2.jpg
    ├── 3.jpg
    ├── 4.jpg
    └── 5.jpg
```

## API Endpoints

### GET `/api/gallery`

Returns all images from the `images/` folder.

**Response:**
```json
{
  "success": true,
  "count": 5,
  "images": [
    {
      "src": "/images/1.jpg",
      "title": "Performance 1",
      "filename": "1.jpg",
      "extension": ".jpg"
    }
  ]
}
```

### GET `/api/health`

Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Customization

### Colors
The website uses the Sugar & Stories color palette defined in `assets/css/main.css`:

```css
:root {
  --cocoa: #3E3333;
  --merlot: #5E3F44;
  --mauve: #A47E82;
  --peony: #E6CECE;
  --petal: #F7EAEB;
  --almond: #F0E7E2;
}
```

### Typography
- **Headings**: Cormorant Garamond (serif)
- **Body Text**: Montserrat (sans-serif)

### Adding New Images
Simply add image files to the `images/` folder and refresh the gallery page. The system will automatically:
- Detect new images
- Generate appropriate titles
- Sort them properly
- Display them in the gallery

## Development

### Adding New Features
1. **Frontend**: Edit HTML, CSS, or JavaScript files in the `assets/` folder
2. **Backend**: Modify `server.js` for new API endpoints
3. **Restart server**: Use `npm run dev` for automatic restarts

### Troubleshooting

**Gallery not loading?**
- Check that the server is running (`npm start`)
- Verify images are in the `images/` folder
- Check browser console for errors
- Test API endpoint: `http://localhost:3000/api/gallery`

**Images not showing?**
- Ensure image files are valid (JPG, PNG, GIF, WebP)
- Check file permissions
- Verify file paths are correct

## Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Environment Variables
- `PORT`: Server port (default: 3000)

## License

MIT License - feel free to use this template for your own projects!

## Support

For issues or questions, please check the troubleshooting section above or create an issue in the repository. 