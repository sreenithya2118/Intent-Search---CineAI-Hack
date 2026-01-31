# Adding Lottie Animations to Home Page

## How to Add Lottie Animations from LottieFiles

1. **Visit LottieFiles**: Go to https://lottiefiles.com
2. **Search for animations**: Search for terms like:
   - "video"
   - "search"
   - "upload"
   - "play"
   - "media"
3. **Choose a free animation**: Select a free animation that matches your theme
4. **Get the JSON URL**:
   - Click on the animation
   - Click "Share" or "Download"
   - Copy the JSON URL (it will look like: `https://lottie.host/embed/...`)
5. **Add to the code**:
   - Open `frontend/src/components/LottieAnimation.jsx`
   - Update the `ANIMATION_URLS` object with your URLs:
   ```javascript
   const ANIMATION_URLS = {
     video: 'https://lottie.host/embed/YOUR_VIDEO_ANIMATION_ID/...',
     search: 'https://lottie.host/embed/YOUR_SEARCH_ANIMATION_ID/...',
     upload: 'https://lottie.host/embed/YOUR_UPLOAD_ANIMATION_ID/...'
   }
   ```

## Alternative: Use Animation Directly

You can also pass a URL directly to the component:
```jsx
<LottieAnimation 
  type="video" 
  url="https://lottie.host/embed/YOUR_ANIMATION_ID/..."
/>
```

## Recommended Free Animations

- Video/Media animations: Search "video player", "media", "play button"
- Search animations: Search "search", "magnifying glass", "find"
- Upload animations: Search "upload", "cloud upload", "file upload"

The component will automatically fall back to beautiful animated icons if the Lottie animation fails to load.

