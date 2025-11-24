# Firebase Hosting Setup

This project is configured for Firebase Hosting deployment.

## Initial Setup

1. **Login to Firebase**
   ```bash
   pnpm firebase:init
   ```
   This will:
   - Log you into Firebase
   - Initialize Firebase Hosting
   - You'll need to select or create a Firebase project

2. **Update Project ID**
   - After initialization, update `.firebaserc` with your actual Firebase project ID
   - Replace `"your-project-id"` with your Firebase project ID

## Deployment

### Deploy to Firebase Hosting
```bash
pnpm deploy
```
This will build the app and deploy it to Firebase Hosting.

### Test Locally
```bash
pnpm firebase:serve
```
This serves your built app locally using Firebase Hosting emulator.

## Configuration

### firebase.json
- **public**: `dist` - Vite builds to the `dist` folder
- **rewrites**: All routes redirect to `index.html` for SPA routing
- **headers**: Aggressive caching for static assets (1 year)

### .firebaserc
Contains your Firebase project configuration. Make sure to set the correct project ID.

## Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm deploy` - Build and deploy to Firebase
- `pnpm firebase:init` - Initialize Firebase (first time only)
- `pnpm firebase:serve` - Test Firebase Hosting locally

## Notes

- Make sure to run `pnpm build` before deploying to ensure the latest changes are included
- The `dist` folder is ignored by git and should not be committed
- Firebase Hosting uses the built files from the `dist` folder
