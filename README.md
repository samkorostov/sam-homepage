# Terminal Portfolio - Sam Korostov

An interactive, Mac terminal-themed portfolio website built with React and Vite.

## Features

- Interactive terminal interface with command-line navigation
- Mac terminal styling with traffic light buttons
- Command history (arrow keys ↑/↓)
- Tab autocomplete
- ASCII art banner
- Fully configurable via YAML file

## Available Commands

- `about` - Learn more about me
- `experience` - View work experience
- `projects` - See projects
- `skills` - Check out technical skills
- `contact` - Get in touch
- `clear` - Clear the terminal
- `help` - Show available commands

## Development

### Install dependencies
```bash
npm install
```

### Run development server
```bash
npm run dev
```

### Build for production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

## Configuration

Edit `config.yaml` to customize your portfolio content:
- Personal information
- About section
- Work experience
- Projects
- Technical skills

After editing `config.yaml`, copy it to the public folder:
```bash
cp config.yaml public/config.yaml
```

## Deployment to GitHub Pages

This project is configured with GitHub Actions for automatic deployment.

### Setup Steps:

1. **Create a GitHub repository** and push this code

2. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Under "Build and deployment", select "GitHub Actions" as the source

3. **Update base path** (if needed):
   - If deploying to `username.github.io` → set `base: '/'` in `vite.config.js`
   - If deploying to `username.github.io/repo-name` → set `base: '/repo-name/'` in `vite.config.js`

4. **Push to main branch**:
   - The GitHub Action will automatically build and deploy your site
   - Your site will be available at `https://username.github.io/repo-name/`

### Manual Deployment:

```bash
npm run build
# Upload contents of dist/ folder to your hosting provider
```

## Tech Stack

- React 19
- Vite 7
- JavaScript
- CSS3
- js-yaml for config parsing

## License

MIT
