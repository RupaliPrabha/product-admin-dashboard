"use client";

import {Suspense, useEffect, useState } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { isLoggedIn, logoutUser } from "../../lib/auth";
import ProductTable from "../components/ProductTable";
import ProductCard from "../components/ProductCard";
import {
  getProducts,
  searchProducts,
  getCategories,
  getProductsByCategory,
} from "../../lib/productApi";

interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
  rating: number;
  stock: number;
  thumbnail: string;
}

const PAGE_SIZES = [10, 20, 50];

function ProductsPageContent() {
  interface Category {
    slug: string;
    name: string;
    url: string;
  }

  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const pageParam = Number(searchParams.get("page"));
  const sizeParam = Number(searchParams.get("size"));
  const searchParam = searchParams.get("search") || "";
  const categoryParam = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "";

  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState(searchParam);
  const [category, setCategory] = useState(categoryParam);

  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  const pageSize = PAGE_SIZES.includes(sizeParam) ? sizeParam : 10;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const currentPage = Math.min(page, totalPages);

  const skip = (currentPage - 1) * pageSize;

  useEffect(() => {
    if (!loading && page !== currentPage) {
      const params = new URLSearchParams(searchParams.toString());

      params.set("page", String(currentPage));

      router.replace(`/products?${params.toString()}`);
    }
  }, [loading, page, currentPage, router, searchParams]);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");

        let sortBy = "";
        let order = "";

        if (sort) {
          const [field, direction] = sort.split("-");

          sortBy = field;
          order = direction;
        }

        let data;

        if (search.trim()) {
          data = await searchProducts(
            search.trim(),
            pageSize,
            skip,
            controller.signal,
            sortBy,
            order,
          );
        } else if (category) {
          data = await getProductsByCategory(
            category,
            pageSize,
            skip,
            sortBy,
            order,
          );
        } else {
          data = await getProducts(pageSize, skip, sortBy, order);
        }

        const deletedProducts = JSON.parse(
          sessionStorage.getItem("deletedProducts") || "[]",
        );

        const updatedProducts = JSON.parse(
          sessionStorage.getItem("updatedProducts") || "{}",
        );

        const addedProducts = JSON.parse(
          sessionStorage.getItem("addedProducts") || "[]",
        );

        const filteredProducts = data.products
          .filter((product: Product) => !deletedProducts.includes(product.id))
          .map((product: Product) => {
            const updatedProduct = updatedProducts[String(product.id)];

            return updatedProduct ? { ...product, ...updatedProduct } : product;
          });

        const visibleAddedProducts = addedProducts
          .filter((product: Product) => !deletedProducts.includes(product.id))
          .filter((product: Product) => {
            if (search.trim()) {
              const searchValue = search.trim().toLowerCase();

              return (
                product.title.toLowerCase().includes(searchValue) ||
                product.category.toLowerCase().includes(searchValue)
              );
            }

            if (category) {
              return product.category.toLowerCase() === category.toLowerCase();
            }

            return true;
          })
          .map((product: Product) => ({
            ...product,
            thumbnail:
              product.thumbnail ||
              "https://cdn.dummyjson.com/product-images/1/thumbnail.jpg",
            rating: product.rating ?? 0,
            stock: product.stock ?? 0,
          }));

        const combinedProducts = [...visibleAddedProducts, ...filteredProducts];

        if (sort) {
          const [field, direction] = sort.split("-");

          combinedProducts.sort((a: Product, b: Product) => {
            if (field === "title") {
              const comparison = a.title.localeCompare(b.title);
              return direction === "asc" ? comparison : -comparison;
            }

            const comparison =
              a[field as "price" | "rating"] - b[field as "price" | "rating"];

            return direction === "asc" ? comparison : -comparison;
          });
        }

        setProducts(combinedProducts.slice(0, pageSize));
        setTotal(
          data.total - deletedProducts.length + visibleAddedProducts.length,
        );
      } catch (error: unknown) {
        if (axios.isCancel(error)) {
          return;
        }
        console.error("Product API error:", error);
        setError("Failed to load products.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 500);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [router, pageSize, skip, search, category, sort, retryCount]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();

        const categoryNames = data.map((item: Category) => item.slug);

        setCategories(categoryNames);
      } catch (error: unknown) {
        console.error("Category API error:", error);
      }
    };

    loadCategories();
  }, []);

  const updateUrl = (newPage: number, newSize: number) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("page", String(newPage));
    params.set("size", String(newSize));

    router.push(`/products?${params.toString()}`);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    setSearch(value);

    const params = new URLSearchParams(searchParams.toString());

    if (value.trim()) {
      params.set("search", value);
    } else {
      params.delete("search");
    }

    params.set("page", "1");

    router.push(`/products?${params.toString()}`);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      updateUrl(currentPage - 1, pageSize);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      updateUrl(currentPage + 1, pageSize);
    }
  };

  const handlePageSizeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const newSize = Number(event.target.value);

    updateUrl(1, newSize);
  };

  const handleLogout = () => {
    logoutUser();
    router.replace("/login");
  };

  const start = total === 0 ? 0 : skip + 1;
  const end = Math.min(skip + products.length, total);

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-gray-800 sm:text-2xl lg:text-3xl">
          Product Admin Dashboard
        </h1>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/products/add")}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            + Add Product
          </button>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Products</h2>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center">
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search products..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 lg:w-64"
            />

            <select
              value={category}
              onChange={(e) => {
                const value = e.target.value;

                setCategory(value);
                setSearch("");

                const params = new URLSearchParams(searchParams.toString());

                if (value) {
                  params.set("category", value);
                } else {
                  params.delete("category");
                }

                params.delete("search");
                params.set("page", "1");

                router.push(`/products?${params.toString()}`);
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 lg:w-auto"
            >
              <option value="">All Categories</option>

              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => {
                const value = e.target.value;

                const params = new URLSearchParams(searchParams.toString());

                if (value) {
                  params.set("sort", value);
                } else {
                  params.delete("sort");
                }

                params.set("page", "1");

                router.push(`/products?${params.toString()}`);
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 lg:w-auto"
            >
              <option value="">Sort By</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Rating: High to Low</option>
              <option value="rating-asc">Rating: Low to High</option>
              <option value="title-asc">Title: A to Z</option>
              <option value="title-desc">Title: Z to A</option>
            </select>

            <div className="flex items-center gap-2">
              <label htmlFor="pageSize" className="text-sm text-gray-600">
                Page size:
              </label>

              <select
                id="pageSize"
                value={pageSize}
                onChange={handlePageSizeChange}
                className="rounded-lg border border-gray-300 px-3 py-2"
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading && <div className="p-8 text-center">Loading products...</div>}

        {error && (
          <div className="p-8 text-center">
            <p className="mb-4 text-red-600">{error}</p>

            <button
              onClick={() => setRetryCount((count) => count + 1)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        )}
        {!loading && !error && products.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No products found.
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <>
            <ProductTable products={products} />
            <ProductCard products={products} />

            <div className="mt-6 border-t pt-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Showing text */}
                <p className="text-center text-sm text-gray-500 sm:text-left">
                  Showing{" "}
                  <span className="font-medium text-gray-700">
                    {start}–{end}
                  </span>{" "}
                  of <span className="font-medium text-gray-700">{total}</span>
                </p>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-1">
                  {/* Previous */}
                  <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">‹</span>
                  </button>

                  {/* Page numbers - Desktop */}
                  <div className="hidden items-center gap-1 sm:flex">
                    {Array.from(
                      { length: totalPages },
                      (_, index) => index + 1,
                    ).map((pageNumber) => (
                      <button
                        key={pageNumber}
                        onClick={() => updateUrl(pageNumber, pageSize)}
                        className={`min-w-9 rounded-lg px-3 py-2 text-sm font-medium transition ${
                          pageNumber === currentPage
                            ? "bg-blue-600 text-white shadow-sm"
                            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ))}
                  </div>

                  {/* Current page - Mobile */}
                  <div className="flex items-center rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 sm:hidden">
                    Page {currentPage} of {totalPages}
                  </div>

                  {/* Next */}
                  <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <span className="sm:hidden">›</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <ProductsPageContent />
    </Suspense>
  );
}
