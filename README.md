# Crypto Zoo

A comprehensive visualization and exploration tool for cryptographic primitives and their relationships. Visit [www.crypto-zoo.net](https://www.crypto-zoo.net) to explore the interactive graph of cryptographic primitives.

## 🚀 Live Demo

**[Visit Crypto Zoo →](https://www.crypto-zoo.net)**

## ✨ Features

- **🔐 User Authentication**: Secure sign-up and sign-in with email/password (optional for browsing)
- **📝 Edit Request System**: Anonymous users can submit suggestions for new primitives or updates to existing ones
- **👨‍💼 Admin Dashboard**: Review and approve/reject user-submitted edit requests
- **🔍 Advanced Search**: Find cryptographic primitives and constructions quickly with intelligent search
- **📊 Interactive Graph View**: Explore relationships between cryptographic primitives
- **📚 Detailed Information**: Comprehensive details about each primitive including definitions, references, and relationships
- **🧮 Mathematical Notation**: Beautiful LaTeX rendering for mathematical expressions and formulas
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **🎨 Modern UI**: Clean, intuitive interface with smooth animations and transitions
- **🔗 Relationship Mapping**: Visualize how cryptographic primitives build upon each other
- **🔄 Real-time Updates**: Dynamic content updates when edit requests are approved

## 🛠️ Technology Stack

- **Frontend**: React 19 with TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS with custom design system
- **Visualization**: D3.js
- **Mathematical Rendering**: KaTeX
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Deployment**: GitHub Pages with GitHub Actions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

```bash
# Clone the repository
git clone https://github.com/jxguan/crypto-zoo.git
cd crypto-zoo

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Set up database schema
# Run the SQL in supabase-schema.sql in your Supabase dashboard

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
│   ├── Auth.tsx        # Authentication component
│   ├── AdminDashboard.tsx # Admin interface
│   ├── EditRequestForm.tsx # Edit request submission
│   ├── LatexRenderer.tsx
│   └── Navbar.tsx
├── pages/              # Page components
│   ├── HomePage.tsx
│   ├── GraphView.tsx
│   ├── SearchPage.tsx
│   ├── VertexPage.tsx
│   ├── EdgePage.tsx
│   ├── ToolPage.tsx
│   ├── AdminPage.tsx   # Admin dashboard page
│   └── SubmitEditPage.tsx # Edit request page
├── services/           # Data services and utilities
│   └── supabaseService.ts   # Supabase service layer
├── lib/                # Library configurations
│   └── supabase.ts     # Supabase client configuration
├── types/              # TypeScript type definitions
│   └── crypto.ts
└── assets/             # Static assets
```

## 🎯 Key Components

- **HomePage**: Landing page with overview and navigation
- **SearchPage**: Advanced search functionality for primitives and constructions
- **VertexPage**: Detailed view of individual cryptographic primitives
- **EdgePage**: Information about cryptographic constructions and relationships
- **GraphView**: Interactive graph visualization
- **AdminPage**: Admin dashboard for managing edit requests
- **SubmitEditPage**: User interface for submitting edit requests
- **Auth**: Authentication component for sign-up/sign-in
- **Navbar**: Navigation and search bar component with user menu
- **LatexRenderer**: Component for rendering mathematical notation

## 🔐 Authentication & User Management

### User Roles

- **Anonymous Users**: Can browse, search, and submit edit requests without registration
- **Regular Users**: Can browse, search, and submit edit requests (with account)
- **Admin Users**: Can review and approve/reject edit requests, plus all regular user features

### Edit Request System

1. **Submit**: **Anonymous users can suggest new primitives or updates to existing ones** without needing to register or log in
2. **Optional Email**: Users can optionally provide their email address to receive updates about their request status
3. **Review**: Admins review submitted requests in the admin dashboard
4. **Approve/Reject**: Admins can approve or reject requests with notes
5. **Auto-Apply**: Approved requests are automatically applied to the database

## 🌐 Deployment

The project is automatically deployed to GitHub Pages via GitHub Actions:

- **Live Site**: [www.crypto-zoo.net](https://www.crypto-zoo.net)
- **Repository**: [github.com/jxguan/crypto-zoo](https://github.com/jxguan/crypto-zoo)
- **Deployment**: Automatic deployment on push to master branch

### Environment Variables

For deployment, you'll need to set these environment variables:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## 📋 Setup Guide

For detailed setup instructions, see [SETUP.md](SETUP.md).

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
- Backend powered by Supabase
- Styled with Tailwind CSS
- Mathematical rendering powered by KaTeX
- Icons from Lucide React
