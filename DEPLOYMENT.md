# GitHub Pages Deployment Guide

This project is configured to deploy to GitHub Pages automatically.

## Automatic Deployment (Recommended)

The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and deploys the app to GitHub Pages whenever you push to the `main` or `master` branch.

### Setup Steps:

1. **Enable GitHub Pages in your repository:**
   - Go to your repository settings
   - Navigate to "Pages" in the left sidebar
   - Under "Source", select "GitHub Actions"

2. **Push to main/master branch:**
   - The workflow will automatically trigger on push
   - You can also manually trigger it from the "Actions" tab

3. **Access your deployed app:**
   - Your app will be available at: `https://[username].github.io/Kraton/`
   - Replace `[username]` with your GitHub username

## Manual Deployment

If you prefer to deploy manually:

1. **Install gh-pages (if not already installed):**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Build and deploy:**
   ```bash
   npm run deploy
   ```

   This will:
   - Build the app with the correct base path for GitHub Pages
   - Deploy the `dist` folder to the `gh-pages` branch

## Base Path Configuration

The app is configured to work with GitHub Pages subdirectory structure:
- **Repository name:** `Kraton`
- **Base path:** `/Kraton/`
- **Full URL:** `https://[username].github.io/Kraton/`

If your repository has a different name, update the `base` path in `vite.config.ts`:

```typescript
base: process.env.GITHUB_PAGES === 'true' ? '/Your-Repo-Name/' : '/',
```

## Local Development vs Production

- **Local development:** Uses base path `/` (root)
- **GitHub Pages:** Uses base path `/Kraton/` (subdirectory)

The build script automatically detects the environment and uses the correct base path.

## Troubleshooting

### Assets not loading
- Make sure the base path in `vite.config.ts` matches your repository name
- Clear browser cache and hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### 404 errors on refresh
- GitHub Pages doesn't support client-side routing by default
- This app uses conditional rendering (no router), so this shouldn't be an issue
- If you add routing later, you'll need to configure a 404.html redirect

### Build fails
- Check that all dependencies are installed: `npm install`
- Verify Node.js version (18+ recommended)
- Check GitHub Actions logs for detailed error messages

