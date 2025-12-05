# User-Aware Cart System Documentation

This documentation explains the new cart system that intelligently handles both guest carts (localStorage) and authenticated user carts (database).

## 🎯 Problem Solved

**Before**: Cart items persisted in localStorage even after login, causing confusion where new users would see items they never added.

**After**: Smart cart system that:

- Uses localStorage for guests
- Transfers guest cart to user account on login
- Starts fresh for new user logins
- Maintains user cart in database

## 🏗️ System Architecture

### Database Structure

```sql
-- Cart table for persistent user carts
CREATE TABLE public.cart (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, product_id)
);
```

### Cart Flow Logic

```
📱 Guest User (Not Logged In)
├── Cart stored in localStorage as 'guest_cart'
├── All cart operations work locally
└── Cart persists across browser sessions

🔐 User Logs In
├── System detects authentication
├── Merges guest cart with user's existing cart
├── Saves merged cart to database
├── Clears guest cart from localStorage
└── All future operations use database

👤 Authenticated User
├── Cart stored in database table 'cart'
├── All operations sync to database
├── Cart persists across devices
└── Cart cleared on logout (returns to guest mode)
```

## 🔧 API Reference

### Core Functions

#### `getCartItems(): Promise<CartItem[]>`

Auto-detects user state and returns appropriate cart.

```typescript
const cart = await getCartItems(); // Works for both guests and users
```

#### `addToCart(productId: string, quantity?: number): Promise<void>`

Adds item to guest localStorage or user database.

```typescript
await addToCart("product-123", 2); // Adds 2 items
```

#### `removeFromCart(productId: string): Promise<void>`

Removes item from cart.

```typescript
await removeFromCart("product-123");
```

#### `updateCartItemQuantity(productId: string, quantity: number): Promise<void>`

Updates item quantity.

```typescript
await updateCartItemQuantity("product-123", 5);
```

#### `clearCart(): Promise<void>`

Clears entire cart (guest or user).

```typescript
await clearCart();
```

#### `mergeGuestCartWithUserCart(userId: string): Promise<void>`

Merges guest cart with user cart on login.

```typescript
// Automatically called on login - no manual call needed
await mergeGuestCartWithUserCart(user.id);
```

### Helper Functions

#### `getCartItemCount(): Promise<number>`

Gets total item count (async).

```typescript
const count = await getCartItemCount();
```

#### `getCartItemCountSync(): number`

Gets guest cart count synchronously (for header).

```typescript
const count = getCartItemCountSync(); // For initial header display
```

#### `isInCart(productId: string): Promise<boolean>`

Checks if item exists in cart.

```typescript
const exists = await isInCart("product-123");
```

#### `calculateCartTotal(cartItems: CartItemWithProduct[]): number`

Calculates total cart value.

```typescript
const total = calculateCartTotal(cartItemsWithPrices);
```

## 🔄 Authentication Integration

### Login Flow

```typescript
// In auth.ts - after successful login
window.dispatchEvent(new Event("authStateChanged"));
```

### Header Component

```typescript
// Listens for auth changes and merges cart
useEffect(() => {
  const checkUser = async () => {
    const currentUser = await getCurrentUser();

    if (currentUser && !previousUser) {
      // User just logged in - merge guest cart
      await mergeGuestCartWithUserCart(currentUser.id);
    }
  };

  checkUser();
}, [user]);
```

## 🗄️ Database Setup

### Required SQL Scripts

1. **Cart Table Creation** (`scripts/add_cart_table.sql`):
   - Creates `cart` table
   - Sets up RLS policies
   - Creates helper functions

2. **Profiles & Reviews** (`scripts/existing_auth_setup.sql`):
   - Creates `profiles` table
   - Creates `reviews` table
   - Sets up user management

### Setup Steps

1. Run `scripts/add_cart_table.sql` in Supabase SQL editor
2. Run `scripts/existing_auth_setup.sql` for complete setup
3. Verify tables exist in Supabase dashboard

## 🎨 User Experience

### Guest User Journey

```
1. Browse products → Add to cart → Items stored locally
2. Continue shopping → Cart persists in localStorage
3. Login/Register → Cart transfers to account
4. Complete purchase → Cart clears
```

### Returning User Journey

```
1. Login → Cart loads from database
2. Add items → Saves to database
3. Logout → Returns to guest mode (empty cart)
4. Login again → Previous cart restored
```

### New User Experience

```
1. Register → Starts with empty cart
2. Add items → Saves to database
3. Cross-device login → Same cart everywhere
```

## 🔧 Implementation Examples

### Product Page Integration

```typescript
const ProductPage = () => {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = async () => {
    await addToCart(product.id, quantity);
    toast({ title: "Added to cart!" });
  };

  return (
    <button onClick={handleAddToCart}>
      Add to Cart
    </button>
  );
};
```

### Cart Page Integration

```typescript
const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const loadCart = async () => {
      const cart = await getCartItems();
      // Fetch product details and set state
    };

    loadCart();
  }, []);

  const handleUpdateQuantity = async (id: string, quantity: number) => {
    await updateCartItemQuantity(id, quantity);
    // Refresh cart display
  };
};
```

### Header Cart Count

```typescript
const Header = () => {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Initial load (sync for immediate display)
    setCartCount(getCartItemCountSync());

    // Listen for cart updates
    const updateCount = async () => {
      setCartCount(await getCartItemCount());
    };

    window.addEventListener("cartUpdated", updateCount);
    return () => window.removeEventListener("cartUpdated", updateCount);
  }, []);
};
```

## 🚨 Important Events

### Custom Events Dispatched

- `"cartUpdated"` - When cart changes
- `"authStateChanged"` - When user logs in/out

### Event Listeners

```typescript
// Listen for cart updates
window.addEventListener("cartUpdated", () => {
  // Update UI, refresh count, etc.
});

// Listen for auth state changes
window.addEventListener("authStateChanged", () => {
  // Handle login/logout cart transitions
});
```

## 🐛 Troubleshooting

### Common Issues

**Cart doesn't update after login**

- Verify `authStateChanged` event is fired after login
- Check `mergeGuestCartWithUserCart` is called
- Ensure database cart table exists with proper RLS policies

**Guest cart persists after login**

- Verify guest cart is cleared after merge: `clearGuestCart()`
- Check if merge function completed successfully

**User cart doesn't persist**

- Verify cart table exists and RLS policies are correct
- Check authentication token is valid
- Ensure `syncCartToDatabase` function works

**Cart count doesn't update in header**

- Verify `cartUpdated` event is dispatched
- Check event listeners are properly attached
- Use `getCartItemCountSync()` for immediate updates

### Debug Commands

```sql
-- Check user's cart in database
SELECT * FROM public.cart WHERE user_id = 'user-uuid-here';

-- Check cart table structure
\d public.cart;

-- Verify RLS policies
SELECT * FROM pg_policies WHERE tablename = 'cart';
```

## 🔒 Security Notes

- Cart table uses RLS - users can only access their own cart
- Guest carts stored in localStorage (client-side only)
- User carts require authentication for all operations
- No sensitive data stored in guest carts

## 📊 Performance Considerations

- Guest operations are instant (localStorage)
- User operations require database calls (minimal latency)
- Cart merge happens once per login session
- Header uses sync function for immediate display
- Database operations batched where possible

## 🎯 Future Enhancements

- **Cart Expiration**: Auto-clear old guest carts
- **Cart Sharing**: Share cart between devices before login
- **Cart Analytics**: Track cart abandonment rates
- **Wishlist Integration**: Move between cart and wishlist
- **Bulk Operations**: Add multiple items at once
- **Cart Notifications**: Remind users of items in cart
