# share2solve

A simple, single-page web application where people can anonymously share their problems.

## Features

- Submit problems with email
- All data stored in browser's localStorage
- Admin view to see all submitted problems
- Modern, colorful, and responsive design

## Tech Stack

- React 18
- Vite
- CSS3 (with gradients and modern styling)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd share2solve
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:5173`

### Admin View

To access the admin dashboard, add `?admin=view` to the URL:
```
http://localhost:5173/?admin=view
```

## Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` folder.

## Deployment

This project can be easily deployed to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

## License

MIT
