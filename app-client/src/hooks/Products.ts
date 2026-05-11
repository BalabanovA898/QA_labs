import { useEffect, useState } from "react";
import ProductService from "../http/services/ProductsService";
import { Product, ProductsQuery } from "../http/models/Products";

export const useProducts = (query?: ProductsQuery) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    ProductService.getAll(query).then((res) => {
      if (res.success) {
        setProducts(res.data?.products || []);
      } else {
        setError(res.error);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(query)]);

  return { products, setProducts, error };
};

export const useProduct = (id: string) => {
  const [product, setProduct] = useState<Product | undefined>();
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    ProductService.getById(id).then((res) => {
      if (res.success) {
        setProduct(res.data?.product);
      } else {
        setError(res.error);
      }
    });
  }, [id]);

  return { product, error };
};
