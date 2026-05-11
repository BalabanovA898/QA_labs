import { $api } from "..";
import { ApiResponse, Message } from "../models/ApiResponse";
import {
  Dish,
  DishCreateDTO,
  DishProduct,
  DishQueryParams,
} from "../models/Dishes";
import notify from "../../store/notify";

export default class DishService {
  static async getDishes(query?: DishQueryParams) {
    const result = await $api.get<ApiResponse<{ dishes: Dish[] }>>("/dishes", {
      params: query,
    });
    const data = result.data;
    if (!data.success) {
      console.error(data.error);
    }
    return data;
  }

  static async createDishe(data: DishCreateDTO) {
    const result = await $api.post<ApiResponse<Dish>>("/dishes", data);
    const response = result.data;
    if (response.success) {
      notify.success(`Блюдо «${data.name}» успешно создано`);
    } else {
      console.error(response.error);
    }
    return response;
  }

  static async updateDishe(id: string, data: DishCreateDTO) {
    const result = await $api.put<ApiResponse<Message>>(`/dishes/${id}`, data);
    const response = result.data;
    if (response.success) {
      notify.success(`Блюдо «${data.name}» обновлено`);
    } else {
      console.error(response.error);
    }
    return response;
  }

  static async deleteDish(id: string) {
    const result = await $api.delete<ApiResponse<Message>>(`/dishes/${id}`);
    const response = result.data;
    if (response.success) {
      notify.success("Блюдо удалено");
    } else {
      console.error(response.error);
    }
    return response;
  }

  static async getDishProducts(id: string) {
    const result = await $api.get<ApiResponse<{ products: DishProduct[] }>>(
      `/dishes/${id}/products`,
    );
    const data = result.data;
    if (!data.success) {
      console.error(data.error.message);
    }
    return data;
  }
}
