import { assetUrl } from './services/api.js';

export const fruitImages = {
  apple: '/fruits/apple.svg',
  banana: '/fruits/banana.svg',
  orange: '/fruits/orange.svg',
  mango: '/fruits/mango.svg',
  strawberry: '/fruits/strawberry.svg',
  pineapple: '/fruits/pineapple.svg',
  dragonfruit: '/fruits/dragonfruit.svg',
  avocado: '/fruits/avocado.svg',
  grape: '/fruits/grape.svg',
};

const defaultFruitList = [
  '/fruits/apple.svg',
  '/fruits/banana.svg',
  '/fruits/orange.svg',
  '/fruits/mango.svg',
  '/fruits/strawberry.svg',
  '/fruits/pineapple.svg',
  '/fruits/dragonfruit.svg',
  '/fruits/avocado.svg',
  '/fruits/grape.svg',
];

export function getProductImage(product) {
  if (product?.imageUrl) {
    if (product.imageUrl.startsWith('/fruits/') || product.imageUrl.startsWith('/') || product.imageUrl.startsWith('http')) {
      return product.imageUrl;
    }
    return assetUrl(product.imageUrl);
  }

  const name = String(product?.name || '').toLowerCase();
  if (/apple/i.test(name)) return fruitImages.apple;
  if (/banana/i.test(name)) return fruitImages.banana;
  if (/orange|citrus/i.test(name)) return fruitImages.orange;
  if (/mango/i.test(name)) return fruitImages.mango;
  if (/strawberry|berry/i.test(name)) return fruitImages.strawberry;
  if (/pineapple/i.test(name)) return fruitImages.pineapple;
  if (/dragon|pitaya/i.test(name)) return fruitImages.dragonfruit;
  if (/avocado/i.test(name)) return fruitImages.avocado;
  if (/grape/i.test(name)) return fruitImages.grape;

  const order = Number(product?.displayOrder ?? 1);
  const index = Number.isFinite(order) && order > 0 ? Math.floor(order - 1) : 0;
  return defaultFruitList[index % defaultFruitList.length];
}
