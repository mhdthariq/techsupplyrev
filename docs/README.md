# TechSupply E-Commerce Documentation

Welcome to the TechSupply E-Commerce platform documentation. This project is a modern, full-featured e-commerce store built with Next.js, Supabase, and TypeScript.

## 📚 Documentation Index

### 📊 Project Overview & Analysis

- **[Comprehensive Project Report](./report.md)** - Complete project documentation covering:
  - E-Commerce definition and concepts (with academic references)
  - E-Commerce type implemented (B2C)
  - Web components breakdown (UI/UX, Frontend, Backend, Database)
  - Complete technology stack analysis

### 🚀 Setup & Configuration

- **[Getting Started Guide](./GETTING_STARTED.md)** - Development setup and Next.js basics
- **[Account System Setup](./ACCOUNT_SETUP.md)** - Complete user account management setup
- **[Cart System Guide](./CART_SYSTEM.md)** - User-aware shopping cart implementation

### 📋 Planning & Roadmap

- **[Project Roadmap](./ROADMAP.md)** - Strategic plan for future development phases

### Key Features

#### 🛒 **Shopping Cart System**

- Guest cart (localStorage) for unauthenticated users
- Database cart for authenticated users
- Automatic cart migration on login/register
- Cross-device synchronization for logged-in users

#### 👤 **User Management**

- Email-based authentication (Google OAuth removed)
- User profiles with personal information management
- Password management and security
- Real-time authentication state handling

#### 📦 **Order Management**

- Complete order history tracking
- Order status management (pending → delivered)
- Product details in order history
- Order-based review system

#### ⭐ **Product Review System**

- Write reviews for purchased products
- 5-star rating system with comments
- Verified purchase badges
- Automatic "Write Review" prompts for delivered orders
- Review management (view, delete own reviews)

## 🏗️ Technical Architecture

### Frontend Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library

### Backend Stack

- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Row Level Security (RLS)

### Database Schema

#### Core Tables

- `auth.users` - User authentication (Supabase managed)
- `public.profiles` - User profile information
- `public.products` - Product catalog
- `public.orders` - Order history
- `public.order_items` - Order line items
- `public.cart` - User shopping carts
- `public.reviews` - Product reviews

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Supabase account
- Git

### Installation Steps

1. **Clone and Install**

   ```bash
   git clone <repository-url>
   cd techsupplyrev
   npm install
   ```

2. **Environment Setup**

   ```bash
   cp .env.example .env.local
   # Add your Supabase credentials
   ```

3. **Database Setup**
   - Run SQL scripts in Supabase SQL editor:
     - `scripts/existing_auth_setup.sql` (profiles and reviews)
     - `scripts/add_cart_table.sql` (shopping cart)

4. **Start Development**
   ```bash
   npm run dev
   ```

## 🗂️ Project Structure

```
techsupplyrev/
├── app/                    # Next.js App Router pages
│   ├── account/           # User account management
│   ├── auth/              # Authentication pages
│   ├── cart/              # Shopping cart
│   ├── checkout/          # Order checkout
│   └── product/           # Product pages
├── components/            # Reusable React components
├── lib/                   # Utility libraries
│   ├── auth.ts           # Authentication functions
│   ├── cart.ts           # Cart management
│   ├── database.ts       # Database helpers
│   └── types/            # TypeScript interfaces
├── scripts/              # Database setup scripts
└── docs/                 # Documentation
```

## 🔧 Configuration

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Configuration

- RLS enabled on all user-specific tables
- Automatic profile creation on user signup
- Automatic product rating updates on review changes
- Cross-table foreign key constraints

## 🎯 User Flows

### Guest Shopping Experience

1. Browse products → Add to cart (localStorage)
2. Proceed to checkout → Prompted to login/register
3. After authentication → Cart transfers to account
4. Complete purchase → Order saved to database

### Authenticated User Experience

1. Login → Cart loads from database
2. Shop across devices → Same cart everywhere
3. Complete orders → Can write reviews
4. Manage account → Edit profile, view orders, manage reviews

### Account Management Flow

1. Profile tab → Edit personal information
2. Orders tab → View history, write reviews for delivered items
3. Reviews tab → Manage existing reviews, see reviewable products
4. Settings tab → Change password, account preferences

## 🔒 Security Features

- Row Level Security (RLS) on all user tables
- Users can only access their own data
- Secure password hashing (Supabase managed)
- Input validation and sanitization
- CSRF protection via Supabase

## 📊 Performance Optimizations

- Lazy loading of cart data
- Optimistic UI updates
- Database indexes on frequently queried columns
- Efficient cart merge algorithms
- Cached cart counts for immediate display

## 🐛 Troubleshooting

### Common Issues

**Cart count not showing for logged-in users**

- Verify cart table exists with proper RLS policies
- Check authentication token validity
- Ensure `getCurrentCartCount()` function works

**Reviews not appearing**

- Verify reviews table exists
- Check order status is "delivered" or "completed"
- Ensure user has actually purchased the product

**Profile not loading**

- Check profiles table exists
- Verify user profile was created on signup
- Check RLS policies allow user access

### Debug Tools

```sql
-- Check user's cart
SELECT * FROM public.cart WHERE user_id = 'user-uuid';

-- Check user's orders
SELECT * FROM public.orders WHERE user_id = 'user-uuid';

-- Check user's reviews
SELECT * FROM public.reviews WHERE user_id = 'user-uuid';
```

## 📈 Analytics & Monitoring

### Key Metrics to Track

- Cart abandonment rate
- Review submission rate
- Order completion rate
- User registration conversion
- Average order value

### Recommended Tools

- Google Analytics for user behavior
- Supabase Dashboard for database metrics
- Vercel Analytics for performance monitoring

## 🔄 Future Enhancements

### Planned Features

- Wishlist functionality
- Product recommendations
- Order tracking system
- Email notifications
- Advanced search and filtering
- Inventory management

### Technical Improvements

- Performance optimization
- Mobile app development
- Advanced caching strategies
- Automated testing suite
- CI/CD pipeline

## 📞 Support & Contributing

### Getting Help

1. Check this documentation
2. Review troubleshooting guides
3. Check GitHub issues
4. Create new issue with detailed description

### Development Guidelines

- Follow TypeScript best practices
- Use Prettier for code formatting
- Write descriptive commit messages
- Test changes thoroughly before submitting

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

---

**Built with ❤️ using Next.js and Supabase**

_Last updated: December 2024_
