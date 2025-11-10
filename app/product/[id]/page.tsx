"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { addToCart as addToCartUtil } from "@/lib/cart";
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Check,
  Minus,
  Plus,
  ArrowLeft,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_price: number | null;
  category: string;
  image_url: string;
  rating: number;
  reviews_count: number;
  in_stock: boolean;
  stock_quantity: number;
  featured: boolean;
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState("description");
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!params.id) return;

      try {
        // Fetch product details
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select("*")
          .eq("id", params.id)
          .single();

        if (productError) {
          console.error("Error fetching product:", productError);
          router.push("/products");
          return;
        }

        setProduct(productData);

        // Fetch related products from same category
        if (productData?.category) {
          const { data: relatedData } = await supabase
            .from("products")
            .select("*")
            .eq("category", productData.category)
            .neq("id", productData.id)
            .limit(4);

          setRelatedProducts(relatedData || []);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id, supabase, router]);

  const addToCart = () => {
    if (!product) return;
    addToCartUtil(product.id, quantity);
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  const shareProduct = () => {
    if (navigator.share && product) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock_quantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white rounded-2xl h-96 animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-white rounded animate-pulse" />
              <div className="h-4 bg-white rounded animate-pulse w-3/4" />
              <div className="h-4 bg-white rounded animate-pulse w-1/2" />
              <div className="h-12 bg-white rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] pt-32 pb-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#2c3e50] mb-4">
            Product Not Found
          </h1>
          <p className="text-[#7f8c8d] mb-8">
            The product you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-[#3498db] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#2980b9] transition"
          >
            <ArrowLeft size={20} />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const discountPercentage = product.discount_price
    ? Math.round((1 - product.discount_price / product.price) * 100)
    : 0;

  const finalPrice = product.discount_price || product.price;

  return (
    <div className="min-h-screen bg-[#f8f9fa] pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-[#7f8c8d] mb-8">
          <Link href="/" className="hover:text-[#3498db]">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#3498db]">
            Products
          </Link>
          <span>/</span>
          <Link
            href={`/products?category=${product.category}`}
            className="hover:text-[#3498db]"
          >
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-[#2c3e50] font-medium">{product.name}</span>
        </nav>

        {/* Product Details */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl overflow-hidden shadow-md relative group">
              <Image
                src={product.image_url || "/placeholder.svg"}
                alt={product.name}
                width={500}
                height={500}
                className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {product.discount_price && (
                <div className="absolute top-4 right-4 bg-[#e74c3c] text-white px-3 py-1 rounded-full text-sm font-bold">
                  -{discountPercentage}%
                </div>
              )}
              {!product.in_stock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="bg-white text-[#2c3e50] px-6 py-3 rounded-xl font-bold">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#2c3e50] mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={
                        i < Math.floor(product.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
                <span className="text-lg font-bold text-[#2c3e50]">
                  {product.rating}
                </span>
                <span className="text-[#7f8c8d]">
                  ({product.reviews_count} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl font-bold text-[#3498db]">
                  ${finalPrice.toFixed(2)}
                </span>
                {product.discount_price && (
                  <span className="text-xl text-[#7f8c8d] line-through">
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 mb-6">
                {product.in_stock ? (
                  <>
                    <Check className="text-green-500" size={20} />
                    <span className="text-green-600 font-medium">
                      In Stock ({product.stock_quantity} available)
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-red-500 font-medium">
                      Out of Stock
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Quantity Selector & Add to Cart */}
            {product.in_stock && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="font-medium text-[#2c3e50]">Quantity:</span>
                  <div className="flex items-center border border-[#ecf0f1] rounded-lg">
                    <button
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-[#f8f9fa] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 py-2 font-medium">{quantity}</span>
                    <button
                      onClick={incrementQuantity}
                      disabled={quantity >= product.stock_quantity}
                      className="p-2 hover:bg-[#f8f9fa] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={addToCart}
                    className="flex-1 bg-[#3498db] hover:bg-[#2980b9] text-white py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition transform hover:scale-105"
                  >
                    <ShoppingCart size={20} />
                    Add to Cart
                  </button>
                  <button
                    onClick={toggleWishlist}
                    className={`p-4 rounded-xl border-2 transition ${
                      isWishlisted
                        ? "bg-[#e74c3c] border-[#e74c3c] text-white"
                        : "border-[#ecf0f1] hover:border-[#3498db] hover:text-[#3498db]"
                    }`}
                  >
                    <Heart size={20} fill={isWishlisted ? "white" : "none"} />
                  </button>
                  <button
                    onClick={shareProduct}
                    className="p-4 rounded-xl border-2 border-[#ecf0f1] hover:border-[#3498db] hover:text-[#3498db] transition"
                  >
                    <Share2 size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-[#ecf0f1]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#ecf0f1] rounded-full flex items-center justify-center text-[#3498db]">
                  <Truck size={20} />
                </div>
                <div>
                  <div className="font-medium text-[#2c3e50]">
                    Free Shipping
                  </div>
                  <div className="text-sm text-[#7f8c8d]">
                    On orders over $50
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#ecf0f1] rounded-full flex items-center justify-center text-[#3498db]">
                  <RotateCcw size={20} />
                </div>
                <div>
                  <div className="font-medium text-[#2c3e50]">
                    30-Day Returns
                  </div>
                  <div className="text-sm text-[#7f8c8d]">Easy returns</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#ecf0f1] rounded-full flex items-center justify-center text-[#3498db]">
                  <Shield size={20} />
                </div>
                <div>
                  <div className="font-medium text-[#2c3e50]">Warranty</div>
                  <div className="text-sm text-[#7f8c8d]">1 year warranty</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="bg-white rounded-2xl shadow-md mb-16">
          <div className="border-b border-[#ecf0f1]">
            <div className="flex gap-8 px-8">
              {["description", "specifications", "reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`py-4 font-medium capitalize transition ${
                    selectedTab === tab
                      ? "text-[#3498db] border-b-2 border-[#3498db]"
                      : "text-[#7f8c8d] hover:text-[#2c3e50]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-8">
            {selectedTab === "description" && (
              <div className="prose max-w-none">
                <p className="text-[#2c3e50] leading-relaxed">
                  {product.description || "No description available."}
                </p>
              </div>
            )}

            {selectedTab === "specifications" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-[#ecf0f1]">
                    <span className="font-medium text-[#2c3e50]">Category</span>
                    <span className="text-[#7f8c8d]">{product.category}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#ecf0f1]">
                    <span className="font-medium text-[#2c3e50]">Brand</span>
                    <span className="text-[#7f8c8d]">TechSupply</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#ecf0f1]">
                    <span className="font-medium text-[#2c3e50]">Rating</span>
                    <span className="text-[#7f8c8d]">{product.rating}/5</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-[#ecf0f1]">
                    <span className="font-medium text-[#2c3e50]">
                      Availability
                    </span>
                    <span
                      className={
                        product.in_stock ? "text-green-600" : "text-red-600"
                      }
                    >
                      {product.in_stock ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#ecf0f1]">
                    <span className="font-medium text-[#2c3e50]">SKU</span>
                    <span className="text-[#7f8c8d]">
                      {product.id.slice(0, 8)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#ecf0f1]">
                    <span className="font-medium text-[#2c3e50]">Weight</span>
                    <span className="text-[#7f8c8d]">0.5 kg</span>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === "reviews" && (
              <div>
                <div>
                  <h3 className="text-xl font-bold text-[#2c3e50] mb-4">
                    Customer Reviews
                  </h3>
                  <button className="bg-[#3498db] text-white px-4 py-2 rounded-lg hover:bg-[#2980b9] transition">
                    Write Review
                  </button>
                </div>
                <div className="text-center text-[#7f8c8d] py-12">
                  <p>No reviews yet. Be the first to review this product!</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold text-[#2c3e50] mb-8">
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/product/${relatedProduct.id}`}
                >
                  <div className="bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105">
                    <div className="aspect-square bg-[#f8f9fa] overflow-hidden">
                      <Image
                        src={relatedProduct.image_url || "/placeholder.svg"}
                        alt={relatedProduct.name}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-[#2c3e50] line-clamp-2 mb-2">
                        {relatedProduct.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        {relatedProduct.discount_price ? (
                          <>
                            <span className="text-lg font-bold text-[#3498db]">
                              ${relatedProduct.discount_price.toFixed(2)}
                            </span>
                            <span className="text-sm text-[#7f8c8d] line-through">
                              ${relatedProduct.price.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-[#3498db]">
                            ${relatedProduct.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
