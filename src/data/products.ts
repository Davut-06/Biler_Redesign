import image8 from "../assets/products/strawberry-mohito.png";
import image9 from "../assets/products/bilberry-mohito.png";
import image10 from "../assets/products/berry.png";
import image11 from "../assets/products/lemon.png";
import image12 from "../assets/products/mineral-water.png";
import image13 from "../assets/products/carbonated-water.png";
import image0 from "../assets/products/classic-mohito.png";
import image1 from "../assets/products/orange.png";
import image2 from "../assets/products/pineapple.png";
import image3 from "../assets/products/pomegranate.png";
import image4 from "../assets/products/raspberry.png";
import image5 from "../assets/products/smorodina.png";
import image6 from "../assets/products/cold-coffee.png";
import image7 from "../assets/products/carbonated-coffee.png";

export type ProductCategory = "mohito" | "vitaminized" | "coffee" | "water";
export interface Product {
  slug: string;
  descriptionKey: string;
  volume: number;
  vitamins: { name: string; amount: string; amountMg?: number }[];
  ingredients: string[];
  nutrition: { name: string; amount: string }[];
  id: string;
  name: string;
  category: ProductCategory;
  accent: string;
  image: string;
  imagePath: string;
  imageScale?: number;
  imageBottom?: number;
}

const catalogue: Omit<
  Product,
  | "slug"
  | "descriptionKey"
  | "volume"
  | "vitamins"
  | "ingredients"
  | "nutrition"
>[] = [
  {
    id: "mohito-classic",
    imageScale: 103.874,
    imageBottom: -1.004,
    name: "CLASSIC MOJITO",
    category: "mohito",
    accent: "#b7ec78",
    image: image0,
    imagePath: "src/assets/products/classic-mohito.png",
  },
  {
    id: "orange",
    imageScale: 103.504,
    imageBottom: -2.022,
    name: "Orange",
    category: "vitaminized",
    accent: "#ffb347",
    image: image1,
    imagePath: "src/assets/products/orange.png",
  },
  {
    id: "pineapple",
    imageScale: 103.92,
    imageBottom: -1.857,
    name: "Pineapple",
    category: "vitaminized",
    accent: "#ffd65a",
    image: image2,
    imagePath: "src/assets/products/pineapple.png",
  },
  {
    id: "pomegranate",
    imageScale: 107.413,
    imageBottom: -5.455,
    name: "Pomegranate",
    category: "vitaminized",
    accent: "#ee4457",
    image: image3,
    imagePath: "src/assets/products/pomegranate.png",
  },
  {
    id: "raspberry",
    imageScale: 100.599,
    imageBottom: -0.067,
    name: "Raspberry",
    category: "vitaminized",
    accent: "#ef629b",
    image: image4,
    imagePath: "src/assets/products/raspberry.png",
  },
  {
    id: "smorodina",
    imageScale: 104.64,
    imageBottom: -1.731,
    name: "Blackcurrant",
    category: "vitaminized",
    accent: "#b38ae0",
    image: image5,
    imagePath: "src/assets/products/smorodina.png",
  },
  {
    id: "cold-coffee",
    imageScale: 103.226,
    imageBottom: -1.882,
    name: "Iced Black Coffee",
    category: "coffee",
    accent: "#c9a16b",
    image: image6,
    imagePath: "src/assets/products/cold-coffee.png",
  },
  {
    id: "carbonated-coffee",
    imageScale: 105.223,
    imageBottom: -2.019,
    name: "Carbonated Coffee",
    category: "coffee",
    accent: "#bb793e",
    image: image7,
    imagePath: "src/assets/products/carbonated-coffee.png",
  },
  {
    id: "strawberry-mohito",
    imageScale: 102.674,
    imageBottom: -1.07,
    name: "STRAWBERRY MOJITO",
    category: "mohito",
    accent: "#ff4584",
    image: image8,
    imagePath: "src/assets/products/strawberry-mohito.png",
  },
  {
    id: "bilberry-mohito",
    imageScale: 100.138,
    imageBottom: -0.138,
    name: "BILBERRY MOJITO",
    category: "mohito",
    accent: "#795dff",
    image: image9,
    imagePath: "src/assets/products/bilberry-mohito.png",
  },
  {
    id: "berry",
    imageScale: 103.061,
    imageBottom: -1.429,
    name: "Berry",
    category: "vitaminized",
    accent: "#b978ee",
    image: image10,
    imagePath: "src/assets/products/berry.png",
  },
  {
    id: "lemon",
    imageScale: 100.787,
    imageBottom: -0.525,
    name: "Lemon",
    category: "vitaminized",
    accent: "#e5ec55",
    image: image11,
    imagePath: "src/assets/products/lemon.png",
  },
  {
    id: "mineral-water",
    imageScale: 102.811,
    imageBottom: -1.74,
    name: "Mineral Water",
    category: "water",
    accent: "#7dd3ff",
    image: image12,
    imagePath: "src/assets/products/mineral-water.png",
  },
  {
    id: "carbonated-water",
    imageScale: 102.128,
    imageBottom: -0.931,
    name: "Carbonated Water",
    category: "water",
    accent: "#a5e7ed",
    image: image13,
    imagePath: "src/assets/products/carbonated-water.png",
  },
];

const familyOrder: ProductCategory[] = [
  "vitaminized",
  "mohito",
  "coffee",
  "water",
];
// Orange vitamin quantities supplied for the product; no serving basis is inferred.
const orangeVitamins: Product["vitamins"] = [
  { name: "C", amount: "", amountMg: 3.5 },
  { name: "B2", amount: "", amountMg: 2.5 },
  { name: "B3", amount: "", amountMg: 5.3 },
  { name: "B5", amount: "", amountMg: 2.4 },
  { name: "B6", amount: "", amountMg: 2.19 },
];
export const products: Product[] = [...catalogue]
  .sort(
    (a, b) => familyOrder.indexOf(a.category) - familyOrder.indexOf(b.category),
  )
  .map((product) => ({
    ...product,
    slug: product.id === "mohito-classic" ? "classic-mohito" : product.id,
    descriptionKey: "flavours." + product.id,
    volume: 240,
    vitamins: product.id === "orange" ? orangeVitamins : product.category === "vitaminized"
      ? ["C", "B2", "B3", "B5", "B6"].map((name) => ({ name, amount: "" })) : [],
    ingredients: [],
    nutrition: [],
    accent:
      product.id === "berry"
        ? "#b83862"
        : product.id === "pomegranate"
          ? "#a92346"
          : product.accent,
  }));
