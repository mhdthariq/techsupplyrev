"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

// Example component showing different toast usage patterns
export default function ToastExamples() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Basic success toast
  const handleSuccess = () => {
    toast.success("Operation completed successfully!");
  };

  // Error toast with custom message
  const handleError = () => {
    toast.error("Something went wrong. Please try again.");
  };

  // Info toast
  const handleInfo = () => {
    toast.info("Please check your email for verification.");
  };

  // Warning toast
  const handleWarning = () => {
    toast.warning("Your session will expire in 5 minutes.");
  };

  // Loading toast
  const handleLoading = () => {
    const loadingToast = toast.loading("Processing your request...");

    // Simulate async operation
    setTimeout(() => {
      toast.dismiss(loadingToast);
      toast.success("Request completed!");
    }, 3000);
  };

  // Toast with description and action
  const handleDetailedToast = () => {
    toast.success("Product added to cart!", {
      description: "Nike Air Max 90 - Size 42",
      action: {
        label: "View Cart",
        onClick: () => router.push("/cart")
      }
    });
  };

  // Promise-based toast (recommended for API calls)
  const handlePromiseToast = async () => {
    const promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.5 ? resolve("Success!") : reject("Failed!");
      }, 2000);
    });

    toast.promise(promise, {
      loading: "Creating your account...",
      success: "Account created successfully!",
      error: "Failed to create account. Please try again."
    });
  };

  // E-commerce specific examples
  const addToCart = async (productId: string) => {
    try {
      setLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success("Added to cart!", {
        description: "Product has been added to your shopping cart",
        action: {
          label: "View Cart",
          onClick: () => router.push("/cart")
        }
      });
    } catch (error) {
      toast.error("Failed to add to cart", {
        description: error instanceof Error ? error.message : "Please try again"
      });
    } finally {
      setLoading(false);
    }
  };

  const processCheckout = async () => {
    const checkoutPromise = fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [] })
    });

    toast.promise(checkoutPromise, {
      loading: 'Processing your order...',
      success: (response) => {
        router.push('/order-confirmation');
        return 'Order placed successfully!';
      },
      error: 'Payment failed. Please check your card details.'
    });
  };

  // Admin operations example
  const deleteProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete product');

      toast.success("Product deleted", {
        description: "The product has been removed from your store",
        action: {
          label: "Undo",
          onClick: () => {
            // Implement undo logic
            toast.info("Product restored");
          }
        }
      });
    } catch (error) {
      toast.error("Failed to delete product", {
        description: "Please check your permissions and try again"
      });
    }
  };

  // Multiple toasts (avoid this, but if needed)
  const handleMultipleToasts = () => {
    toast.info("Starting process...");

    setTimeout(() => {
      toast.loading("Step 1: Validating data...");
    }, 500);

    setTimeout(() => {
      toast.loading("Step 2: Processing payment...");
    }, 1500);

    setTimeout(() => {
      toast.success("All steps completed!");
    }, 3000);
  };

  // Custom toast with JSX
  const handleCustomToast = () => {
    toast.custom((id) => (
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            🎉
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">Welcome back!</h4>
            <p className="text-sm text-gray-600">You have 3 new messages</p>
          </div>
          <button
            onClick={() => toast.dismiss(id)}
            className="ml-auto text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Toast System Examples
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Basic Toasts */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Basic Toasts</h2>
          <button
            onClick={handleSuccess}
            className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Success Toast
          </button>
          <button
            onClick={handleError}
            className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Error Toast
          </button>
          <button
            onClick={handleInfo}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Info Toast
          </button>
          <button
            onClick={handleWarning}
            className="w-full bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Warning Toast
          </button>
        </div>

        {/* Advanced Toasts */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Advanced Toasts</h2>
          <button
            onClick={handleLoading}
            className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            Loading Toast
          </button>
          <button
            onClick={handleDetailedToast}
            className="w-full bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
          >
            Toast with Action
          </button>
          <button
            onClick={handlePromiseToast}
            className="w-full bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
          >
            Promise Toast
          </button>
          <button
            onClick={handleCustomToast}
            className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Custom Toast
          </button>
        </div>

        {/* E-commerce Examples */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">E-commerce</h2>
          <button
            onClick={() => addToCart("product-123")}
            disabled={loading}
            className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add to Cart"}
          </button>
          <button
            onClick={processCheckout}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Process Checkout
          </button>
          <button
            onClick={() => deleteProduct("product-123")}
            className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Delete Product
          </button>
          <button
            onClick={handleMultipleToasts}
            className="w-full bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          >
            Multi-step Process
          </button>
        </div>

      </div>

      {/* Code Examples */}
      <div className="mt-12 space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">Code Examples</h2>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Basic Usage:</h3>
          <pre className="text-sm text-gray-700">
{`import { toast } from "@/hooks/use-toast";

// Simple success
toast.success("Product saved!");

// Error with details
toast.error("Failed to save", {
  description: "Please check all required fields"
});

// With action button
toast.success("Item added to cart!", {
  action: {
    label: "View Cart",
    onClick: () => router.push("/cart")
  }
});`}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Promise-based (Recommended for API calls):</h3>
          <pre className="text-sm text-gray-700">
{`const saveProduct = async () => {
  const promise = fetch('/api/products', {
    method: 'POST',
    body: JSON.stringify(productData)
  });

  toast.promise(promise, {
    loading: 'Saving product...',
    success: 'Product saved successfully!',
    error: 'Failed to save product'
  });
};`}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Error Handling Pattern:</h3>
          <pre className="text-sm text-gray-700">
{`try {
  await apiCall();
  toast.success("Operation completed!");
} catch (error) {
  toast.error(
    error instanceof Error
      ? error.message
      : "An unexpected error occurred"
  );
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
