import Image from "next/image";
import Link from "next/link";

interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
  rating: number;
  stock: number;
  thumbnail: string;
}

interface ProductTableProps {
  products: Product[];
}

export default function ProductTable({ products }: ProductTableProps) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-left text-sm text-gray-600">
            <th className="p-4">Image</th>
            <th className="p-4">Title</th>
            <th className="p-4">Category</th>
            <th className="p-4">Price</th>
            <th className="p-4">Rating</th>
            <th className="p-4">Stock</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <tr
              key={product.id}
              className="border-b border-gray-100 transition hover:bg-gray-50"
            >
              <td className="p-4">
                <Image
                  src={product.thumbnail}
                  alt={product.title}
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded object-cover"
                />
              </td>

              <td className="p-4 font-medium">
                <Link
                  href={`/products/${product.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {product.title}
                </Link>
              </td>

              <td className="p-4 capitalize">{product.category}</td>

              <td className="p-4 font-medium text-gray-800">
                ${product.price}
              </td>

              <td className="p-4">{product.rating}</td>

              <td className="p-4">{product.stock}</td>
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <Link
                    href={`/products/${product.id}`}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    View
                  </Link>

                  <Link
                    href={`/products/${product.id}/edit`}
                    className="text-sm font-medium text-gray-700 hover:text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
