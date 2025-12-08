import {
  LayoutDashboard,
  Package,
  ImageIcon,
  Tag,
  LogOut,
  ShoppingCart,
  Users,
  Menu,
  X,
} from "lucide-react";

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleLogout: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  handleLogout,
  isOpen,
  setIsOpen,
}: AdminSidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "orders", label: "Pesanan", icon: ShoppingCart },
    { id: "users", label: "Pengguna", icon: Users },
    { id: "products", label: "Produk", icon: Package },
    { id: "banners", label: "Banner", icon: ImageIcon },
    { id: "coupons", label: "Kupon", icon: Tag },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="fixed top-4 left-4 z-50 rounded-lg bg-white p-2 shadow-md md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-[#2C3E50]">Admin Panel</h1>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false); // Close sidebar on mobile when item clicked
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                  activeTab === item.id
                    ? "bg-[#3498DB] text-white shadow-md shadow-blue-200"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-red-500 transition-colors hover:bg-red-50"
          >
            <LogOut size={20} />
            <span className="font-medium">Keluar</span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
