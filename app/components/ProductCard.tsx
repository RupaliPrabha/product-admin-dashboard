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

interface ProductCardProps {
  products: Product[];
}

export default function ProductCard({ products }: ProductCardProps) {
  return (
    <div className="space-y-3 md:hidden">
      {products.map((product) => (
        <div
          key={product.id}
          className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
        >
          <Image
            src={product.thumbnail}
            alt={product.title}
            width={64}
            height={64}
            className="h-16 w-16 shrink-0 rounded object-cover"
          />

          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-gray-900">
              <Link
                href={`/products/${product.id}`}
                className="hover:text-blue-600 hover:underline"
              >
                {product.title}
              </Link>
            </h3>

            <p className="mt-1 text-sm capitalize text-gray-500">
              {product.category}
            </p>

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
              <span>Price: ${product.price}</span>

              <span>Rating: {product.rating}</span>

              <span>Stock: {product.stock}</span>
            </div>
            <div className="mt-3 flex items-center gap-4">
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
          </div>
        </div>
      ))}
    </div>
  );
}
