interface Product {
    name: string;
    image: string;
    category: string;
    price: number;
    sold: number;
    profit: number;
}

interface LoginPayload {
  username: string;
  code: string;
}