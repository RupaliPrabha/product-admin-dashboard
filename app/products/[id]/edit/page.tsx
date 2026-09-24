"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProductById, updateProduct } from "../../../../lib/productApi";
import { isLoggedIn } from "@/lib/auth";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const id = String(params.id);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }

    const loadProduct = async () => {
      try {
        const addedProducts = JSON.parse(
          sessionStorage.getItem("addedProducts") || "[]",
        );

        const addedProduct = addedProducts.find(
          (product: { id: number }) => product.id === Number(id),
        );

        let data;

        if (addedProduct) {
          data = addedProduct;
        } else {
          data = await getProductById(id);
        }

        const updatedProducts = JSON.parse(
          sessionStorage.getItem("updatedProducts") || "{}",
        );

        const updatedProduct = updatedProducts[id];

        const finalProduct = updatedProduct
          ? { ...data, ...updatedProduct }
          : data;

        setTitle(finalProduct.title);
        setPrice(String(finalProduct.price));
        setCategory(finalProduct.category);
        setDescription(finalProduct.description);
      } catch (error) {
        console.error("Load product error:", error);
        setError("Failed to load product.");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, router]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (saving) return;

    setError("");

    if (!title.trim()) {
      setError("Product title is required.");
      return;
    }

    if (!price || Number(price) <= 0) {
      setError("Price must be greater than 0.");
      return;
    }

    if (!category.trim()) {
      setError("Category is required.");
      return;
    }

    if (!description.trim()) {
      setError("Description is required.");
      return;
    }

    setSaving(true);

    try {
      const updatedProduct = {
        title: title.trim(),
        price: Number(price),
        category: category.trim(),
        description: description.trim(),
      };

      const addedProducts = JSON.parse(
        sessionStorage.getItem("addedProducts") || "[]",
      );

      const isAddedProduct = addedProducts.some(
        (product: { id: number }) => product.id === Number(id),
      );

      if (isAddedProduct) {
        const updatedAddedProducts = addedProducts.map(
          (product: { id: number }) =>
            product.id === Number(id)
              ? { ...product, ...updatedProduct }
              : product,
        );

        sessionStorage.setItem(
          "addedProducts",
          JSON.stringify(updatedAddedProducts),
        );
      } else {
        await updateProduct(id, updatedProduct);

        const updatedProducts = JSON.parse(
          sessionStorage.getItem("updatedProducts") || "{}",
        );

        updatedProducts[id] = updatedProduct;

        sessionStorage.setItem(
          "updatedProducts",
          JSON.stringify(updatedProducts),
        );
      }

      router.push(`/products/${id}`);
    } catch (error) {
      console.error("Update product error:", error);
      setError("Failed to update product.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading product...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => router.push(`/products/${id}`)}
          className="mb-6 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Product
        </button>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>

          <p className="mt-1 text-sm text-gray-500">
            Update the product information.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Product Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Price
              </label>

              <input
                type="number"
                min="0"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Category
              </label>

              <input
                type="text"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={5}
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {saving ? "Updating..." : "Update Product"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
