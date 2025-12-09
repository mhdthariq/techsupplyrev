import { Edit2, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface ProductTableProps {
  products: Product[];
  deleteProduct: (id: string) => void;
  onEdit: (product: Product) => void;
}

export default function ProductTable({
  products,
  deleteProduct,
  onEdit,
}: ProductTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="p-4 text-left font-semibold text-gray-600">
                Nama
              </th>
              <th className="p-4 text-left font-semibold text-gray-600">
                Harga
              </th>
              <th className="p-4 text-left font-semibold text-gray-600">
                Diskon
              </th>
              <th className="p-4 text-left font-semibold text-gray-600">
                Kategori
              </th>
              <th className="p-4 text-left font-semibold text-gray-600">
                Merek
              </th>
              <th className="p-4 text-left font-semibold text-gray-600">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr
                key={product.id}
                className="transition-colors hover:bg-gray-50"
              >
                <td className="p-4 font-medium text-gray-900">
                  {product.name}
                </td>
                <td className="p-4 text-gray-600">
                  {formatCurrency(product.price)}
                </td>
                <td className="p-4 text-gray-600">
                  {product.discount_price
                    ? formatCurrency(product.discount_price)
                    : "-"}
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    {product.category}
                  </span>
                </td>
                <td className="p-4 text-gray-600">{product.brand}</td>
                <td className="flex gap-3 p-4">
                  <button
                    onClick={() => onEdit(product)}
                    className="text-blue-500 transition-colors hover:text-blue-700"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="text-red-500 transition-colors hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
