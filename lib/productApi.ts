import api from "./axios";

export const getProducts = async (
  limit: number,
  skip: number,
  sortBy?: string,
  order?: string
) => {
  const response = await api.get("/products", {
    params: {
      limit,
      skip,
      sortBy,
      order,
    },
  });

  return response.data;
};

export const searchProducts = async (
  query: string,
  limit: number,
  skip: number,
  signal?: AbortSignal,
  sortBy?: string,
  order?: string
) => {
  const response = await api.get("/products/search", {
    params: {
      q: query,
      limit,
      skip,
      sortBy,
      order,
    },
    signal,
  });

  return response.data;
};

export const getCategories = async () => {
  const response = await api.get("/products/categories");

  return response.data;
};

export const getProductsByCategory = async (
  category: string,
  limit: number,
  skip: number,
  sortBy?: string,
  order?: string
) => {
  const response = await api.get(
    `/products/category/${category}`,
    {
      params: {
        limit,
        skip,
        sortBy,
        order,
      },
    }
  );

  return response.data;
};

export const getProductById = async (id: string) => {
  const response = await api.get(`/products/${id}`);

  return response.data;
};

export const createProduct = async (product: {
  title: string;
  price: number;
  category: string;
  description: string;
}) => {
  const response = await api.post("/products/add", product);

  return response.data;
};

export const updateProduct = async (
  id: string,
  product: {
    title: string;
    price: number;
    category: string;
    description: string;
  }
) => {
  const response = await api.put(`/products/${id}`, product);

  return response.data;
};

export const deleteProduct = async (id: string) => {
  const response = await api.delete(`/products/${id}`);

  return response.data;
};