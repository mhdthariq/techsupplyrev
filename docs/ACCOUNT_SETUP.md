# Account System Setup Instructions

This guide will help you set up the comprehensive account management system with user profiles, order history, and product reviews.

## 🎯 What You Get

✅ **Complete User Account Management**
- User profile editing (name, email, phone, address)
- Password management
- Real-time authentication state

✅ **Order History & Management**
- View all past orders with details
- Order status tracking
- Product details for each order item

✅ **Product Review System**
- Write reviews for purchased products
- Star ratings and comments
- Verified purchase badges
- Review management (view/delete own reviews)

✅ **Smart Review Prompts**
- Automatic detection of reviewable products
- "Write Review" buttons for delivered orders
- Prevents duplicate reviews

✅ **Updated Navigation**
- Header shows user menu when logged in
- Easy access to account page
- Sign out functionality

## 🗄️ Database Setup

### Step 1: Run the Reviews Table Migration

Execute this SQL script in your Supabase SQL editor:

```sql
-- File: scripts/create_reviews_table.sql
-- This creates the reviews table, profiles table, and sets up all necessary triggers
```

**Important:** Run the complete `scripts/create_reviews_table.sql` file in your Supabase dashboard.

### Step 2: Verify Database Structure

After running the migration, you should have these tables:

- ✅ `profiles` - User profile information
- ✅ `orders` - Order history (already exists)
- ✅ `order_items` - Order details (already exists) 
- ✅ `reviews` - Product reviews (new)
- ✅ `products` - Product catalog (already exists)

### Step 3: Test the System

1. **Sign up a new user** or **log in** with existing credentials
2. **Navigate to Account** using the user menu in the header
3. **Update your profile** information
4. **View your orders** (if any exist)
5. **Create test orders** to see the review functionality

## 📁 New Files Added

### Type Definitions
- `lib/types/index.ts` - TypeScript interfaces for all data models

### Database Helpers
- `lib/database.ts` - Functions for profile, order, and review management

### Updated Components
- `app/account/page.tsx` - Complete account management interface
- `components/header.tsx` - User menu with account access
- `lib/auth.ts` - Enhanced authentication (no changes needed)

### Database Scripts
- `scripts/create_reviews_table.sql` - Database migration for reviews

## 🚀 Features Overview

### Profile Management
- Edit personal information (name, email, phone, address)
- Change password securely
- View account creation date

### Order History
- Chronological list of all orders
- Order status with color coding
- Product details for each item
- Order total and shipping information

### Review System
- **Write reviews** for products you've purchased
- **Star ratings** (1-5 stars)
- **Verified purchase badges** for authentic reviews
- **Review prompts** appear automatically for delivered orders
- **Manage reviews** - view and delete your own reviews

### Smart Review Logic
- Only shows "Write Review" button for delivered/completed orders
- Prevents duplicate reviews for the same product
- Automatically updates product ratings when reviews are added/deleted
- Shows count of products awaiting review

## 🎨 User Experience

### Navigation Flow
1. **Login/Register** → Header shows user avatar
2. **Click user menu** → Access "My Account" 
3. **Account page tabs**:
   - **Profile** - Personal information and settings
   - **Orders** - Order history with review buttons
   - **Reviews** - Your reviews and reviewable products
   - **Settings** - Password change and account preferences

### Review Workflow
1. **Complete an order** → Order status becomes "delivered"
2. **Visit account page** → See "Write Review" buttons
3. **Click "Write Review"** → Modal opens with rating and comment fields
4. **Submit review** → Review appears in "My Reviews" section
5. **Product rating updates** automatically

## 🔧 Configuration Notes

### Environment Variables
No additional environment variables needed - uses existing Supabase configuration.

### Authentication
- Uses existing email-only authentication (Google OAuth removed)
- Automatic profile creation on user signup
- Session management with real-time updates

### Database Triggers
- Auto-creates user profile when user signs up
- Auto-updates product ratings when reviews change
- Maintains data consistency with foreign key constraints

## 🐛 Troubleshooting

### Common Issues

**User menu doesn't show:**
- Check if user is properly authenticated
- Verify `getCurrentUser()` function is working

**Orders not appearing:**
- Ensure orders exist in database with correct `user_id`
- Check RLS policies allow user to access their own orders

**Reviews not saving:**
- Verify reviews table exists and has proper permissions
- Check if user already reviewed the product (duplicates prevented)

**"Write Review" button missing:**
- Order must have status "delivered" or "completed"
- User must not have already reviewed that specific product

### Database Permissions

If you encounter permission errors, verify these RLS policies exist:

```sql
-- Users can manage their own profiles
-- Users can view their own orders  
-- Users can create/read/update/delete their own reviews
-- Anyone can read reviews (public)
```

## 🎉 Next Steps

1. **Run the database migration** (`scripts/create_reviews_table.sql`)
2. **Test the account system** with a real user account
3. **Create some test orders** to see the review functionality
4. **Customize the styling** if needed to match your brand
5. **Add any additional profile fields** you might need

## 📞 Support

If you encounter any issues:

1. Check the browser console for JavaScript errors
2. Verify database table structure in Supabase
3. Ensure RLS policies are properly configured
4. Test authentication flow step by step

The system is now ready for production use with comprehensive account management, order tracking, and product reviews!