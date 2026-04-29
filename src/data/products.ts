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

const IMAGES = {
  // Hambúrgueres
  smashClassico:   "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=640&q=80",
  truffleWagyu:    "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=640&q=80",
  gardenBurger:    "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=640&q=80",
  bbqBacon:        "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=640&q=80",
  chickenCrispy:   "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=640&q=80",
  veganoSupreme:   "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=640&q=80",
  doubleCheese:    "https://images.unsplash.com/photo-1550547660-d9450f859349?w=640&q=80",
  mushroomSwiss:   "https://images.unsplash.com/photo-1596956470007-2bf6095e7e16?w=640&q=80",
  chickenBBQ:      "https://images.unsplash.com/photo-1550317138-10000687a72b?w=640&q=80",
  xTudo:           "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=640&q=80",
  // Batatas
  batatafrita:     "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=640&q=80",
  batataCheddar:   "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=640&q=80",
  batataRecheada:  "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=640&q=80",
  onionRings:      "https://images.unsplash.com/photo-1639024471283-03518883512d?w=640&q=80",
  batataTorrada:   "https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=640&q=80",
  // Bebidas
  milkshakeChoc:   "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=640&q=80",
  milkshakeOreo:   "https://images.unsplash.com/photo-1577805947697-89e18249d767?w=640&q=80",
  milkshakeMorango:"https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=640&q=80",
  refrigerante:    "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=640&q=80",
  suco:            "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=640&q=80",
  agua:            "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=640&q=80",
  // Hero
  hero: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=1920&q=85",
};

export const HERO_IMAGE = IMAGES.hero;

export const products: Product[] = [
  // ── TRADICIONAIS ─────────────────────────────────────────────────────────
  {
    id: "1",
    name: "Smash Clássico",
    description: "Duplo smash de carne 150g, queijo cheddar, cebola caramelizada, picles e molho especial.",
    price: 32.9,
    image: IMAGES.smashClassico,
    category: "tradicional",
    tags: [],
    bestseller: true,
    ingredients: ["Pão brioche", "2x Carne 75g", "Cheddar", "Cebola caramelizada", "Picles", "Molho especial"],
  },
  {
    id: "2",
    name: "BBQ Bacon",
    description: "Carne angus 200g, bacon crocante, cheddar, onion rings e molho BBQ defumado.",
    price: 42.9,
    image: IMAGES.bbqBacon,
    category: "tradicional",
    tags: [],
    bestseller: true,
    ingredients: ["Pão com gergelim", "Carne angus 200g", "Bacon crocante", "Cheddar", "Onion rings", "Molho BBQ defumado"],
  },
  {
    id: "3",
    name: "Chicken Crispy",
    description: "Frango empanado crocante, maionese de ervas, alface, tomate e pepino.",
    price: 29.9,
    image: IMAGES.chickenCrispy,
    category: "tradicional",
    tags: [],
    ingredients: ["Pão brioche", "Frango empanado", "Maionese de ervas", "Alface", "Tomate", "Pepino"],
  },
  {
    id: "4",
    name: "Double Cheese",
    description: "Dois smashes de carne 100g, duplo cheddar derretido, maionese defumada e picles.",
    price: 38.9,
    image: IMAGES.doubleCheese,
    category: "tradicional",
    tags: [],
    bestseller: true,
    ingredients: ["Pão brioche", "2x Carne 100g", "2x Cheddar", "Maionese defumada", "Picles"],
  },
  {
    id: "5",
    name: "X-Tudo",
    description: "Carne 200g, presunto, bacon, ovo, cheddar, alface, tomate e maionese.",
    price: 44.9,
    image: IMAGES.xTudo,
    category: "tradicional",
    tags: [],
    bestseller: true,
    ingredients: ["Pão com gergelim", "Carne 200g", "Presunto", "Bacon", "Ovo", "Cheddar", "Alface", "Tomate", "Maionese"],
  },
  {
    id: "6",
    name: "Chicken BBQ",
    description: "Frango grelhado marinado, molho BBQ, cheddar, cebola crispy e alface.",
    price: 34.9,
    image: IMAGES.chickenBBQ,
    category: "tradicional",
    tags: [],
    ingredients: ["Pão brioche", "Frango grelhado", "Molho BBQ", "Cheddar", "Cebola crispy", "Alface"],
  },
  // ── PREMIUM ──────────────────────────────────────────────────────────────
  {
    id: "7",
    name: "Truffle Wagyu",
    description: "Blend wagyu 200g, maionese trufada, rúcula, cebola crispy e queijo gruyère.",
    price: 54.9,
    image: IMAGES.truffleWagyu,
    category: "premium",
    tags: [],
    bestseller: true,
    ingredients: ["Pão brioche", "Blend wagyu 200g", "Maionese trufada", "Rúcula", "Cebola crispy", "Queijo gruyère"],
  },
  {
    id: "8",
    name: "Mushroom Swiss",
    description: "Blend angus 200g, cogumelos salteados na manteiga, queijo suíço e aioli de alho.",
    price: 48.9,
    image: IMAGES.mushroomSwiss,
    category: "premium",
    tags: [],
    ingredients: ["Pão ciabatta", "Blend angus 200g", "Cogumelos salteados", "Queijo suíço", "Aioli de alho", "Rúcula"],
  },
  // ── VEGETARIANO ──────────────────────────────────────────────────────────
  {
    id: "9",
    name: "Garden Burger",
    description: "Hambúrguer de portobello grelhado, abacate, pimentão assado e verdes frescos.",
    price: 34.9,
    image: IMAGES.gardenBurger,
    category: "vegetariano",
    tags: ["vegetariano"],
    ingredients: ["Pão integral", "Portobello grelhado", "Abacate", "Pimentão assado", "Mix de verdes", "Molho tahine"],
  },
  {
    id: "10",
    name: "Vegano Supreme",
    description: "Hambúrguer de grão-de-bico, guacamole, tomate seco e rúcula.",
    price: 36.9,
    image: IMAGES.veganoSupreme,
    category: "vegetariano",
    tags: ["vegano", "vegetariano"],
    ingredients: ["Pão vegano", "Hambúrguer de grão-de-bico", "Guacamole", "Tomate seco", "Rúcula"],
  },
  // ── BATATAS / ACOMPANHAMENTOS ─────────────────────────────────────────────
  {
    id: "11",
    name: "Batata Frita Clássica",
    description: "Batatas fritas crocantes temperadas com sal marinho e alecrim.",
    price: 16.9,
    image: IMAGES.batatafrita,
    category: "acompanhamento",
    tags: ["vegetariano", "vegano"],
    ingredients: ["Batata", "Sal marinho", "Alecrim"],
  },
  {
    id: "12",
    name: "Batata Cheddar Bacon",
    description: "Batata frita coberta com cheddar cremoso quente e bacon crocante.",
    price: 26.9,
    image: IMAGES.batataCheddar,
    category: "acompanhamento",
    tags: [],
    bestseller: true,
    ingredients: ["Batata frita", "Cheddar cremoso", "Bacon crocante", "Cebolinha"],
  },

  {
    id: "14",
    name: "Onion Rings",
    description: "Anéis de cebola empanados e fritos com molho ranch para mergulhar.",
    price: 19.9,
    image: IMAGES.onionRings,
    category: "acompanhamento",
    tags: ["vegetariano"],
    ingredients: ["Cebola", "Farinha temperada", "Molho ranch"],
  },
  {
    id: "15",
    name: "Batata Rústica",
    description: "Batata cortada em gomos, assada com páprica defumada e alho.",
    price: 18.9,
    image: IMAGES.batataTorrada,
    category: "acompanhamento",
    tags: ["vegetariano", "vegano", "sem glúten"],
    ingredients: ["Batata rústica", "Páprica defumada", "Alho", "Sal"],
  },
  // ── BEBIDAS ───────────────────────────────────────────────────────────────
  {
    id: "16",
    name: "Milkshake Chocolate",
    description: "Milkshake cremoso de chocolate ao leite com chantilly.",
    price: 22.9,
    image: IMAGES.milkshakeChoc,
    category: "bebida",
    tags: ["vegetariano"],
    ingredients: ["Leite", "Sorvete de chocolate", "Calda de chocolate", "Chantilly"],
  },
  {
    id: "17",
    name: "Milkshake Oreo",
    description: "Milkshake de baunilha com pedaços de Oreo triturados e chantilly.",
    price: 24.9,
    image: IMAGES.milkshakeOreo,
    category: "bebida",
    tags: ["vegetariano"],
    bestseller: true,
    ingredients: ["Leite", "Sorvete de baunilha", "Oreo", "Chantilly"],
  },
  {
    id: "18",
    name: "Milkshake Morango",
    description: "Milkshake com morangos frescos, sorvete e chantilly.",
    price: 23.9,
    image: IMAGES.milkshakeMorango,
    category: "bebida",
    tags: ["vegetariano"],
    ingredients: ["Leite", "Sorvete de morango", "Morangos frescos", "Chantilly"],
  },
  {
    id: "19",
    name: "Refrigerante Lata",
    description: "Coca-Cola, Guaraná, Fanta ou Sprite — 350ml gelado.",
    price: 7.9,
    image: IMAGES.refrigerante,
    category: "bebida",
    tags: ["vegano"],
    ingredients: ["Coca-Cola / Guaraná / Fanta / Sprite 350ml"],
  },
  {
    id: "20",
    name: "Suco Natural",
    description: "Suco de laranja, limão ou maracujá — 400ml natural sem açúcar.",
    price: 12.9,
    image: IMAGES.suco,
    category: "bebida",
    tags: ["vegano", "vegetariano", "sem glúten"],
    ingredients: ["Fruta fresca", "Água gelada"],
  },
  {
    id: "21",
    name: "Água Mineral",
    description: "Água mineral sem gás ou com gás — 500ml.",
    price: 5.9,
    image: IMAGES.agua,
    category: "bebida",
    tags: ["vegano", "vegetariano", "sem glúten"],
    ingredients: ["Água mineral 500ml"],
  },
];

export const categories = [
  { id: "todos",         label: "Todos" },
  { id: "tradicional",  label: "Tradicionais" },
  { id: "premium",      label: "Premium" },
  { id: "vegetariano",  label: "Vegetarianos" },
  { id: "acompanhamento", label: "Batatas & Porções" },
  { id: "bebida",       label: "Bebidas" },
];

export const filterTags = [
  { id: "vegetariano", label: "Vegetariano" },
  { id: "vegano",      label: "Vegano" },
  { id: "sem glúten",  label: "Sem Glúten" },
];
