import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { User, Package, Heart, Settings, LogOut } from "lucide-react";

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="pt-28 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-heading font-bold text-primary-blue mb-12">
            My Account
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Menu */}
            <aside className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow overflow-hidden sticky top-24">
                <nav className="flex flex-col">
                  <Link
                    href="#profile"
                    className="px-6 py-4 bg-accent-blue text-white font-semibold flex items-center gap-3 border-l-4 border-accent-blue"
                  >
                    <User size={20} /> Profile
                  </Link>
                  <Link
                    href="#orders"
                    className="px-6 py-4 hover:bg-light-grey transition flex items-center gap-3 text-primary-blue"
                  >
                    <Package size={20} /> My Orders
                  </Link>
                  <Link
                    href="#wishlist"
                    className="px-6 py-4 hover:bg-light-grey transition flex items-center gap-3 text-primary-blue"
                  >
                    <Heart size={20} /> Wishlist
                  </Link>
                  <Link
                    href="#settings"
                    className="px-6 py-4 hover:bg-light-grey transition flex items-center gap-3 text-primary-blue"
                  >
                    <Settings size={20} /> Settings
                  </Link>
                  <button className="px-6 py-4 hover:bg-light-grey transition flex items-center gap-3 text-primary-blue text-left w-full border-t border-light-grey mt-auto">
                    <LogOut size={20} /> Log Out
                  </button>
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Profile Section */}
              <section id="profile" className="bg-white rounded-lg shadow p-8">
                <h2 className="text-2xl font-heading font-bold text-primary-blue mb-6">
                  Profile Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-primary-blue mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      defaultValue="John"
                      className="w-full border-2 border-light-grey rounded-lg px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-primary-blue mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Doe"
                      className="w-full border-2 border-light-grey rounded-lg px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-primary-blue mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      defaultValue="john@example.com"
                      className="w-full border-2 border-light-grey rounded-lg px-4 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-primary-blue mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      defaultValue="+1 (555) 123-4567"
                      className="w-full border-2 border-light-grey rounded-lg px-4 py-2"
                    />
                  </div>
                </div>
                <button className="mt-6 bg-accent-blue text-white px-6 py-2 rounded-lg hover:bg-accent-blue/90 transition font-semibold">
                  Save Changes
                </button>
              </section>

              {/* Recent Orders */}
              <section id="orders" className="bg-white rounded-lg shadow p-8">
                <h2 className="text-2xl font-heading font-bold text-primary-blue mb-6">
                  Recent Orders
                </h2>
                <div className="space-y-4">
                  {[1, 2, 3].map((order) => (
                    <div
                      key={order}
                      className="border-2 border-light-grey rounded-lg p-4 hover:border-accent-blue transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-heading font-semibold text-primary-blue">
                            Order #{1000 + order}
                          </p>
                          <p className="text-sm text-neutral-grey">
                            Placed on November {order}, 2024
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-accent-blue">
                            ${(order * 79.99).toFixed(2)}
                          </p>
                          <p className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full inline-block mt-1">
                            Delivered
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
