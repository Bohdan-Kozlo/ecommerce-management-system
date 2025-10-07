import { PrismaClient, Category, User, Product } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create categories
  const categories: Category[] = [];
  for (let i = 0; i < 5; i++) {
    const category = await prisma.category.create({
      data: {
        name: faker.commerce.department() + ` ${i + 1}`,
        description: faker.lorem.sentence(),
      },
    });
    categories.push(category);
  }

  // Create products
  const products: Product[] = [];
  for (let i = 0; i < 20; i++) {
    const product = await prisma.product.create({
      data: {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: parseFloat(faker.commerce.price()),
        stock: faker.number.int({ min: 0, max: 100 }),
        categoryId: faker.helpers.arrayElement(categories).id,
      },
    });
    products.push(product);
  }

  // Create product images
  for (const product of products) {
    const numImages = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < numImages; i++) {
      await prisma.productImage.create({
        data: {
          url: faker.image.url(),
          productId: product.id,
        },
      });
    }
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
