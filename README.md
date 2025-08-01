# Crypto Zoo

A comprehensive visualization and exploration tool for cryptographic primitives and their relationships. Visit [www.crypto-zoo.net](https://www.crypto-zoo.net) to explore the interactive graph of cryptographic primitives.

## 🚀 Live Demo

**[Visit Crypto Zoo →](https://www.crypto-zoo.net)**

## ✨ Features

- **🔍 Advanced Search**: Find cryptographic primitives and constructions quickly with intelligent search
- **📊 Interactive Graph View**: Explore relationships between cryptographic primitives (coming soon)
- **📚 Detailed Information**: Comprehensive details about each primitive including definitions, references, and relationships
- **🧮 Mathematical Notation**: Beautiful LaTeX rendering for mathematical expressions and formulas
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **🎨 Modern UI**: Clean, intuitive interface with smooth animations and transitions
- **🔗 Relationship Mapping**: Visualize how cryptographic primitives build upon each other

## 🛠️ Technology Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS with custom design system
- **Visualization**: D3.js (planned)
- **Mathematical Rendering**: KaTeX
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Deployment**: GitHub Pages with GitHub Actions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/jxguan/crypto-zoo.git
cd crypto-zoo

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Deploy to GitHub Pages
npm run deploy
```

## 📁 Project Structure

```
src/
├── components/          # Reusable React components
│   ├── LatexRenderer.tsx
│   └── Navbar.tsx
├── pages/              # Page components
│   ├── HomePage.tsx
│   ├── GraphView.tsx
│   ├── SearchPage.tsx
│   ├── VertexPage.tsx
│   ├── EdgePage.tsx
│   └── ToolPage.tsx
├── data/               # JSON data files
│   ├── crypto-primitives.json
│   ├── vertices.json
│   └── edges.json
├── services/           # Data services and utilities
│   └── cryptoDataService.ts
├── types/              # TypeScript type definitions
│   └── crypto.ts
└── assets/             # Static assets
```

## 🎯 Key Components

- **HomePage**: Landing page with overview and navigation
- **SearchPage**: Advanced search functionality for primitives and constructions
- **VertexPage**: Detailed view of individual cryptographic primitives
- **EdgePage**: Information about cryptographic constructions and relationships
- **GraphView**: Interactive graph visualization (planned)
- **Navbar**: Navigation and search bar component
- **LatexRenderer**: Component for rendering mathematical notation

## 🌐 Deployment

The project is automatically deployed to GitHub Pages via GitHub Actions:

- **Live Site**: [www.crypto-zoo.net](https://www.crypto-zoo.net)
- **Repository**: [github.com/jxguan/crypto-zoo](https://github.com/jxguan/crypto-zoo)
- **Deployment**: Automatic deployment on push to master branch

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with React and TypeScript
- Styled with Tailwind CSS
- Mathematical rendering powered by KaTeX
- Icons from Lucide React
