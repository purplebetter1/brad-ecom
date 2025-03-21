"use server";
import { CartItem } from "@/types";

export async function addItemToCart() {
  return {
    success: true,
    message: "Item added to Cart",
  };
}
