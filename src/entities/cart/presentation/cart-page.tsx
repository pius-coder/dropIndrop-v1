"use client";

import { useState, useEffect } from "react";
import { CartService } from "../../entities/cart/domain/cart-service";
import { CartRepository } from "../../entities/cart/domain/cart-repository";
import { PrismaClient } from "@prisma/client";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

// Assuming you have a way to get the current user ID
const CURRENT_USER_ID = "user-id-placeholder"; // Replace with actual user ID from auth

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    const prisma = new PrismaClient();
    const cartRepo = new CartRepository(prisma);
    const productRepo = {}; // Placeholder for ProductRepository
    const cartService = new CartService({ cartRepository: cartRepo, productRepository: productRepo, prisma });

    const result = await cartService.getCartByUserId(CURRENT_USER_ID);
    if (result.isSuccess) {
      setCart(result.value);
    }
    setLoading(false);
  };

  const addItem = async (productId: string, quantity: number) => {
    const prisma = new PrismaClient();
    const cartRepo = new CartRepository(prisma);
    const productRepo = {};
    const cartService = new CartService({ cartRepository: cartRepo, productRepository: productRepo, prisma });

    await cartService.addItemToCart(CURRENT_USER_ID, productId, quantity);
    loadCart();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Shopping Cart</h1>
      {cart ? (
        <Card>
          <CardHeader>
            <CardTitle>Items in Cart</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Total Items: {cart.totalItems}</p>
            <ul>
              {cart.items.map((item: any) => (
                <li key={item.productId}>
                  Product ID: {item.productId}, Quantity: {item.quantity}
                </li>
              ))}
            </ul>
            <Button onClick={() => addItem("product-id", 1)}>Add Item</Button>
          </CardContent>
        </Card>
      ) : (
        <p>Your cart is empty</p>
      )}
    </div>
  );
}
