export type UserRole = 'user' | 'seller' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  address?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: 'clothing' | 'fabric';
  subcategory: string;
  gender?: 'men' | 'women' | 'kids' | 'unisex';
  color?: string;
  price: number;
  priceINR?: number;
  priceUSD?: number;
  images: string[];
  stock: number;
  sellerId: string;
  rating: number;
  reviewsCount: number;
  isTrending?: boolean;
  season?: 'summer' | 'winter' | 'all';
  variants?: {
    sizes?: string[];
    colors?: string[];
  };
  fabricInfo?: {
    gsm: number;
    material: string;
    colors: string[];
    minOrder: number;
  };
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  variant?: string;
  isFabric?: boolean;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  advancePaid?: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'cod' | 'online';
  shippingAddress: string;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}
