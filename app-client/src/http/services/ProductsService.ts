import { $api } from "..";
import { ApiResponse, Message } from "../models/ApiResponse";
import { Product, ProductCreateDTO, ProductsQuery } from "../models/Products";
import { Dish } from "../models/Dishes";
import notify from "../../store/notify";

export default class ProductService {
  static async getAll(query?: ProductsQuery) {
    const result = await $api.get<ApiResponse<{ products: Product[] }>>(
      "/products",
      { params: query },
    );
    const data = result.data;
    if (!data.success) {
      console.error(data.error.message);
    }
    return data;
  }

  static async getById(id: string) {
    const result = await $api.get<ApiResponse<{ product: Product }>>(
      `products/${id}`,
    );
    const data = result.data;
    if (!data.success) {
      console.error(data.error.message);
    }
    return data;
  }

  static async createProduct(data: ProductCreateDTO) {
    const result = await $api.post<ApiResponse<Message>>("/products", data);
    const response = result.data;
    if (response.success) {
      notify.success(`Продукт «${data.name}» успешно создан`);
    } else {
      console.error(response.error.message);
    }
    return response;
  }

  static async updateProduct(id: string, data: ProductCreateDTO) {
    const result = await $api.put<ApiResponse<Message>>(
      `/products/${id}`,
      data,
    );
    const response = result.data;
    if (response.success) {
      notify.success(`Продукт «${data.name}» обновлён`);
    } else {
      console.error(response.error.message);
    }
    return response;
  }

  static async deleteProduct(id: string) {
    const result = await $api.delete<ApiResponse<Message>>(`/products/${id}`);
    const response = result.data;
    if (response.success) {
      notify.success("Продукт удалён");
    } else {
      console.error(response.error.message);
    }
    return response;
  }

  static async getProductDishes(id: string) {
    const result = await $api.get<ApiResponse<{ dishes: Dish[] }>>(
      `/products/${id}/dishes`,
    );
    const response = result.data;
    if (!response.success) {
      console.error(response.error.message);
    }
    return response;
  }
}
