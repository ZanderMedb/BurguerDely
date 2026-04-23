import burgerClassic from "@/assets/burger-classic.jpg";
import burgerPremium from "@/assets/burger-premium.jpg";
import burgerVeggie from "@/assets/burger-veggie.jpg";
import burgerBbq from "@/assets/burger-bbq.jpg";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: "tradicional" | "premium" | "vegetariano" | "acompanhamento" | "bebida" | "sobremesa";
  tags: string[];
  bestseller?: boolean;
  ingredients: string[];
};

export const products: Product[] = [
  {
    id: "1",
    name: "Smash Clássico",
    description: "Duplo smash de carne 150g, queijo cheddar, cebola caramelizada, picles e molho especial.",
    price: 32.9,
    image: burgerClassic,
    category: "tradicional",
    tags: [],
    bestseller: true,
    ingredients: ["Pão brioche", "2x Carne 75g", "Cheddar", "Cebola caramelizada", "Picles", "Molho especial"],
  },
  {
    id: "2",
    name: "Truffle Wagyu",
    description: "Blend wagyu 200g, maionese trufada, rúcula, cebola crispy e queijo gruyère.",
    price: 54.9,
    image: burgerPremium,
    category: "premium",
    tags: [],
    bestseller: true,
    ingredients: ["Pão brioche", "Blend wagyu 200g", "Maionese trufada", "Rúcula", "Cebola crispy", "Queijo gruyère"],
  },
  {
    id: "3",
    name: "Garden Burger",
    description: "Hambúrguer de portobello grelhado, abacate, pimentão assado e verdes frescos.",
    price: 34.9,
    image: burgerVeggie,
    category: "vegetariano",
    tags: ["vegetariano"],
    ingredients: ["Pão integral", "Portobello grelhado", "Abacate", "Pimentão assado", "Mix de verdes", "Molho tahine"],
  },
  {
    id: "4",
    name: "BBQ Bacon",
    description: "Carne angus 200g, bacon crocante, cheddar, onion rings e molho BBQ defumado.",
    price: 42.9,
    image: burgerBbq,
    category: "tradicional",
    tags: [],
    bestseller: true,
    ingredients: ["Pão com gergelim", "Carne angus 200g", "Bacon crocante", "Cheddar", "Onion rings", "Molho BBQ defumado"],
  },
  {
    id: "5",
    name: "Chicken Crispy",
    description: "Frango empanado crocante, maionese de ervas, alface e tomate.",
    price: 29.9,
    image: burgerClassic,
    category: "tradicional",
    tags: [],
    ingredients: ["Pão brioche", "Frango empanado", "Maionese de ervas", "Alface", "Tomate"],
  },
  {
    id: "6",
    name: "Vegano Supreme",
    description: "Hambúrguer de grão-de-bico, guacamole, tomate seco e rúcula.",
    price: 36.9,
    image: burgerVeggie,
    category: "vegetariano",
    tags: ["vegano", "vegetariano"],
    ingredients: ["Pão vegano", "Hambúrguer de grão-de-bico", "Guacamole", "Tomate seco", "Rúcula"],
  },
  {
    id: "7",
    name: "Batata Frita Artesanal",
    description: "Batatas rústicas temperadas com sal marinho e alecrim.",
    price: 18.9,
    image: burgerClassic,
    category: "acompanhamento",
    tags: ["vegano", "vegetariano", "sem glúten"],
    ingredients: ["Batata", "Sal marinho", "Alecrim"],
  },
  {
    id: "8",
    name: "Milkshake Nutella",
    description: "Milkshake cremoso de Nutella com chantilly.",
    price: 22.9,
    image: burgerPremium,
    category: "bebida",
    tags: ["vegetariano"],
    ingredients: ["Leite", "Sorvete", "Nutella", "Chantilly"],
  },
];

export const categories = [
  { id: "todos", label: "Todos" },
  { id: "tradicional", label: "Tradicionais" },
  { id: "premium", label: "Premium" },
  { id: "vegetariano", label: "Vegetarianos" },
  { id: "acompanhamento", label: "Acompanhamentos" },
  { id: "bebida", label: "Bebidas" },
  { id: "sobremesa", label: "Sobremesas" },
];

export const filterTags = [
  { id: "vegetariano", label: "Vegetariano" },
  { id: "vegano", label: "Vegano" },
  { id: "sem glúten", label: "Sem Glúten" },
];
