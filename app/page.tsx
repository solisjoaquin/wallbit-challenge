"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { XCircle, Moon, Sun, Trash2, Gift } from "lucide-react";
import { useTheme } from "next-themes";

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
  totalPrice: number;
}

const DISCOUNT_CODES = {
  GONCY10: 0.1,
  AGUANTEWALLBIT: 0.25,
  RAZER: 0.5,
};

export default function Component() {
  const [quantity, setQuantity] = useState("");
  const [productId, setProductId] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [error, setError] = useState("");
  const [recommendedProduct, setRecommendedProduct] = useState<Product | null>(
    null
  );
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [creationDate] = useState(() => {
    const now = new Date();
    return now
      .toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(",", " -");
  });
  const { theme, setTheme } = useTheme();

  console.log(
    "Encontraste el primer codigo secreto: GONCY10. Ahora busca los otros dos para obtener un descuento mayor. 😎"
  );

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const addToCart = async (productId: string, quantity: string) => {
    console.log("Agregando producto al carrito...");
    try {
      setError("");
      const response = await fetch(
        `https://fakestoreapi.com/products/${productId}`
      );
      if (!response.ok) {
        throw new Error("Product not found");
      }

      const product: Product = await response.json();
      const newItem: CartItem = {
        ...product,
        quantity: parseInt(quantity),
        totalPrice: product.price * parseInt(quantity),
      };

      setCart((prevCart) => {
        const existingItem = prevCart.find((item) => item.id === newItem.id);
        if (existingItem) {
          return prevCart.map((item) =>
            item.id === newItem.id
              ? {
                  ...item,
                  quantity: item.quantity + newItem.quantity,
                  totalPrice: (item.quantity + newItem.quantity) * item.price,
                }
              : item
          );
        }
        return [...prevCart, newItem];
      });

      setQuantity("");
      setProductId("");
      recommendSimilarProduct(product.category);
    } catch (err) {
      setError("Failed to add product to cart");
      console.error("Failed to add product to cart:", err);
    }
  };

  const removeFromCart = (id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const recommendSimilarProduct = async (category: string) => {
    try {
      const response = await fetch("https://fakestoreapi.com/products");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const products: Product[] = await response.json();
      const similarProducts = products.filter(
        (p) =>
          p.category === category &&
          !cart.some((item) => item.id === p.id) &&
          p.id !== parseInt(productId) // Ensure we don't recommend the just-added product
      );
      if (similarProducts.length > 0) {
        const randomIndex = Math.floor(Math.random() * similarProducts.length);

        setRecommendedProduct(similarProducts[randomIndex]);
        /* setProductId(similarProducts[randomIndex].id.toString());
        setQuantity("1"); */
      } else {
        setRecommendedProduct(null);
      }
    } catch (err) {
      console.error("Failed to fetch similar products:", err);
      setRecommendedProduct(null);
    }
  };

  const applyDiscount = () => {
    const discount =
      DISCOUNT_CODES[discountCode as keyof typeof DISCOUNT_CODES];
    if (discount) {
      setAppliedDiscount(discount);
      setDiscountCode("");
    } else {
      setError("Invalid discount code");
    }
  };

  const [clickCount, setClickCount] = useState(0);
  const [showSecret, setShowSecret] = useState(false);

  const handleClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount === 5) {
      console.log("Encontraste un nuevo codigo secreto: AGUANTEWALLBIT 😎");
      setClickCount(0); // Reset the count
    }
  };

  useEffect(() => {
    if (clickCount === 3) {
      setShowSecret(true);
      const timer = setTimeout(() => {
        setShowSecret(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [clickCount]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const discountAmount = subtotal * appliedDiscount;
  const totalCost = subtotal - discountAmount;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold" onClick={handleClick}>
          Wallbit
        </h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          aria-label="Toggle theme"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2 w-full">
              <label htmlFor="quantity" className="text-sm font-medium">
                Cantidad
              </label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
              />
            </div>
            <div className="flex-1 space-y-2 w-full">
              <label htmlFor="productId" className="text-sm font-medium">
                ID del producto
              </label>
              <Input
                id="productId"
                type="number"
                min="1"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="Enter product ID"
              />
            </div>
            <Button
              onClick={() => {
                addToCart(productId, quantity);
              }}
              disabled={!quantity || !productId}
              className="w-full sm:w-auto"
            >
              Agregar
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            {error}
          </AlertDescription>
        </Alert>
      )}

      {showSecret && (
        <Alert>
          <AlertDescription className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Encontraste el tercer codigo secreto: RAZER. Ahora puedes aplicar el
            descuento. 😎
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Shopping Cart - Creado el {creationDate}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Precio unitario</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Imagen</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cart.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>${item.price.toFixed(2)}</TableCell>
                    <TableCell>${item.totalPrice.toFixed(2)}</TableCell>
                    <TableCell>
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={50}
                        height={50}
                        className="object-contain"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Remove ${item.title} from cart`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={3} className="font-bold">
                    Subtotal:
                  </TableCell>
                  <TableCell colSpan={3} className="font-bold">
                    ${subtotal.toFixed(2)}
                  </TableCell>
                </TableRow>
                {appliedDiscount > 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="font-bold">
                      Descuento ({(appliedDiscount * 100).toFixed(0)}%):
                    </TableCell>
                    <TableCell colSpan={3} className="font-bold text-green-600">
                      -${discountAmount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell colSpan={3} className="font-bold">
                    Total ({totalItems} producto/s):
                  </TableCell>
                  <TableCell colSpan={3} className="font-bold">
                    ${totalCost.toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aplicar descuento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
              placeholder="Encuentra el codigo de descuento en la pagina 😉"
            />
            <Button onClick={applyDiscount}>Apply</Button>
          </div>
        </CardContent>
      </Card>

      {recommendedProduct && (
        <Card>
          <CardHeader>
            <CardTitle>Quizas tambien te guste</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Image
                src={recommendedProduct.image}
                alt={recommendedProduct.title}
                width={100}
                height={100}
                className="object-contain"
              />
              <div className="flex-1">
                <h3 className="font-bold">{recommendedProduct.title}</h3>
                <p>${recommendedProduct.price.toFixed(2)}</p>
              </div>
              <Button
                onClick={() => {
                  // setProductId(recommendedProduct.id.toString());
                  // setQuantity("1");
                  addToCart(recommendedProduct.id.toString(), "1");
                }}
              >
                Agregar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
