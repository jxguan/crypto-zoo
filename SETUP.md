# Crypto Zoo - Dynamic Setup Guide

This guide will help you set up the dynamic version of Crypto Zoo with Supabase backend.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Supabase account

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once your project is created, go to Settings > API
3. Copy your project URL and anon key

### 3. Configure Environment Variables

Create a `.env` file in the root directory with the following content:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace `your_supabase_project_url` and `your_supabase_anon_key` with your actual Supabase credentials.

### 4. Set up Database Schema

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase-schema.sql` into the editor
4. Run the script to create all necessary tables, indexes, and policies

### 5. Import Initial Data (Optional)

If you have existing data in JSON format, you can import it using the Supabase dashboard:

1. Go to Table Editor in your Supabase dashboard
2. Select the `vertices` table
3. Click "Insert" and paste your vertices data
4. Repeat for the `edges` table

### 6. Create Admin User

1. Sign up through the application with your email
2. Go to your Supabase dashboard > Table Editor > users
3. Find your user record and change the `role` from `user` to `admin`

### 7. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Features

### For Regular Users

- **Authentication**: Sign up/sign in with email and password
- **Browse**: View all vertices and edges
- **Search**: Search through primitives and constructions
- **Submit Edits**: Suggest new vertices/edges or updates to existing ones
- **View Graph**: Interactive visualization of the cryptographic primitives

### For Admin Users

- **All Regular User Features**: Plus admin capabilities
- **Review Edit Requests**: Approve or reject user-submitted changes
- **Direct Database Access**: Modify vertices and edges directly through the admin interface
- **User Management**: View and manage user accounts

## Database Schema

### Tables

1. **users**: User accounts with roles (user/admin)
2. **vertices**: Cryptographic primitives
3. **edges**: Relationships between primitives
4. **edit_requests**: User-submitted edit requests

### Security

- Row Level Security (RLS) is enabled on all tables
- Users can only read public data (vertices/edges)
- Only admins can modify vertices/edges directly
- Users can submit edit requests
- Only admins can approve/reject edit requests

## Deployment

### Vercel/Netlify

1. Push your code to GitHub
2. Connect your repository to Vercel or Netlify
3. Add your environment variables in the deployment settings
4. Deploy

### GitHub Pages

```bash
npm run build
npm run deploy
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Make sure your Supabase URL and anon key are correct
2. **Database Connection**: Verify your database schema is set up correctly
3. **RLS Policies**: Check that the Row Level Security policies are in place
4. **CORS Issues**: Ensure your Supabase project allows requests from your domain

### Getting Help

- Check the Supabase documentation
- Review the application logs in the browser console
- Verify your environment variables are loaded correctly

## Development

### Adding New Features

1. Update the TypeScript types in `src/types/crypto.ts`
2. Add new service methods in `src/services/supabaseService.ts`
3. Create new components in `src/components/`
4. Add new pages in `src/pages/`
5. Update routing in `src/App.tsx`

### Database Migrations

When making schema changes:

1. Update the SQL schema in `supabase-schema.sql`
2. Run the new SQL in your Supabase dashboard
3. Update the TypeScript types if needed
4. Test thoroughly before deploying
