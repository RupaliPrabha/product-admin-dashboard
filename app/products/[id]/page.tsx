"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { getProductById, deleteProduct } from "@/lib/productApi";
import { isLoggedIn } from "@/lib/auth";

interface Review {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
}

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  rating: number;
  stock: number;
  images: string[];
  reviews: Review[];
}

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [deleting, setDeleting] = useState(false);

  const id = String(params.id);
  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const deletedProducts = JSON.parse(
          sessionStorage.getItem("deletedProducts") || "[]",
        );

        if (deletedProducts.includes(Number(id))) {
          setError("Product not found.");
          return;
        }

        const addedProducts = JSON.parse(
          sessionStorage.getItem("addedProducts") || "[]",
        );

        const addedProduct = addedProducts.find(
          (product: Product) => product.id === Number(id),
        );

        let data;

        if (addedProduct) {
          data = {
            ...addedProduct,
            images: addedProduct.images || [
              addedProduct.thumbnail ||
                "https://cdn.dummyjson.com/product-images/1/thumbnail.jpg",
            ],
            reviews: addedProduct.reviews || [],
            rating: addedProduct.rating ?? 0,
            stock: addedProduct.stock ?? 0,
          };
        } else {
          data = await getProductById(String(id));
        }

        const updatedProducts = JSON.parse(
          sessionStorage.getItem("updatedProducts") || "{}",
        );

        const updatedProduct = updatedProducts[id];

        const finalProduct = updatedProduct
          ? { ...data, ...updatedProduct }
          : data;

        setProduct(finalProduct);
        setSelectedImage(finalProduct.images[0]);
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setError("Product not found.");
          return;
        }

        console.error("Product details error:", error);
        setError("Failed to load product.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading product...</p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-800">Product Not Found</h1>

        <button
          onClick={() => router.push("/products")}
          className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
        >
          Back to Products
        </button>
      </main>
    );
  }

  const handleDelete = async () => {
    if (deleting) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmed) return;

    setDeleting(true);
    setError("");

    try {
      const addedProducts = JSON.parse(
        sessionStorage.getItem("addedProducts") || "[]",
      );

      const isAddedProduct = addedProducts.some(
        (product: { id: number }) => product.id === Number(id),
      );

      if (isAddedProduct) {
        const remainingProducts = addedProducts.filter(
          (product: { id: number }) => product.id !== Number(id),
        );

        sessionStorage.setItem(
          "addedProducts",
          JSON.stringify(remainingProducts),
        );
      } else {
        await deleteProduct(String(id));
      }

      const deletedProducts = JSON.parse(
        sessionStorage.getItem("deletedProducts") || "[]",
      );

      if (!deletedProducts.includes(Number(id))) {
        deletedProducts.push(Number(id));
      }

      sessionStorage.setItem(
        "deletedProducts",
        JSON.stringify(deletedProducts),
      );

      router.push("/products");
    } catch (error) {
      console.error("Delete product error:", error);
      setError("Failed to delete product.");
      setDeleting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <button
        onClick={() => router.push("/products")}
        className="mb-6 text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        ← Back to Products
      </button>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Product Images */}
          <div>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              <Image
                src={selectedImage}
                alt={product.title}
                width={600}
                height={600}
                className="h-80 w-full object-contain sm:h-96"
              />
            </div>

            <div className="mt-4 grid grid-cols-4 gap-3">
              {product.images.slice(0, 4).map((image, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => setSelectedImage(image)}
                  className={`overflow-hidden rounded-lg border bg-gray-50 ${
                    selectedImage === image
                      ? "border-blue-500 ring-2 ring-blue-100"
                      : "border-gray-200"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.title} ${index + 1}`}
                    width={120}
                    height={120}
                    className="h-20 w-full object-contain"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Information */}
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-blue-600">
              {product.category}
            </p>

            <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
              {product.title}
            </h1>

            <p className="mt-4 leading-7 text-gray-600">
              {product.description}
            </p>

            <div className="mt-6">
              <p className="text-3xl font-bold text-gray-900">
                ${product.price}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Rating</p>
                <p className="mt-1 font-semibold text-gray-900">
                  {product.rating}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Stock</p>
                <p className="mt-1 font-semibold text-gray-900">
                  {product.stock}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => router.push(`/products/${id}/edit`)}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Edit Product
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete Product"}
              </button>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-900">
                Customer Reviews
              </h2>

              <div className="mt-4 space-y-4">
                {product.reviews.length > 0 ? (
                  product.reviews.map((review, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-gray-200 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-gray-900">
                          {review.reviewerName}
                        </p>

                        <span className="text-sm text-gray-500">
                          {review.date}
                        </span>
                      </div>

                      <p className="mt-1 text-sm font-medium text-gray-700">
                        Rating: {review.rating}/5
                      </p>

                      <p className="mt-2 text-sm leading-6 text-gray-600">
                        {review.comment}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No reviews available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
