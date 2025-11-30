import { PrismaClient, Category, OrderStatus, DeliveryMethod } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Categories
  const categoriesData = [
    { name: 'Smartphones', description: 'Latest mobile phones and smartphones' },
    { name: 'Laptops', description: 'High performance laptops and notebooks' },
    { name: 'Audio', description: 'Headphones, speakers, and audio equipment' },
    { name: 'Wearables', description: 'Smartwatches, fitness trackers, and wearable tech' },
    { name: 'Accessories', description: 'Essential tech accessories, cables, and chargers' },
  ];

  const categories: Category[] = [];
  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
    categories.push(category);
  }

  const productsData = [
    {
      name: 'iPhone 15 Pro',
      description:
        'The ultimate iPhone with titanium design, A17 Pro chip, and advanced camera system.',
      price: 999,
      stock: 50,
      categoryName: 'Smartphones',
      image: 'https://placehold.co/600x400/png?text=iPhone+15+Pro',
    },
    {
      name: 'Samsung Galaxy S24 Ultra',
      description:
        'Galaxy AI is here. Unleash new levels of creativity, productivity and possibility.',
      price: 1299,
      stock: 50,
      categoryName: 'Smartphones',
      image: 'https://placehold.co/600x400/png?text=Samsung+Galaxy+S24',
    },
    {
      name: 'MacBook Air M3',
      description: 'Lean. Mean. M3 machine. Supercharged by the next-generation M3 chip.',
      price: 1099,
      stock: 30,
      categoryName: 'Laptops',
      image: 'https://placehold.co/600x400/png?text=MacBook+Air+M3',
    },
    {
      name: 'Dell XPS 15',
      description: 'Power and portability defined. Stunning display and powerful performance.',
      price: 1499,
      stock: 20,
      categoryName: 'Laptops',
      image: 'https://placehold.co/600x400/png?text=Dell+XPS+15',
    },
    {
      name: 'Sony WH-1000XM5',
      description: 'Industry leading noise cancellation with exceptional sound quality.',
      price: 349,
      stock: 100,
      categoryName: 'Audio',
      image: 'https://placehold.co/600x400/png?text=Sony+Headphones',
    },
    {
      name: 'AirPods Pro 2',
      description:
        'Magic like you’ve never heard. Active Noise Cancellation and Transparency mode.',
      price: 249,
      stock: 150,
      categoryName: 'Audio',
      image: 'https://placehold.co/600x400/png?text=AirPods+Pro',
    },
    {
      name: 'Apple Watch Series 9',
      description: 'Smarter. Brighter. Mightier. The most powerful chip in Apple Watch ever.',
      price: 399,
      stock: 60,
      categoryName: 'Wearables',
      image: 'https://placehold.co/600x400/png?text=Apple+Watch',
    },
    {
      name: 'Garmin Fenix 7',
      description: 'Built for the outdoors. Long battery life and advanced training features.',
      price: 699,
      stock: 25,
      categoryName: 'Wearables',
      image: 'https://placehold.co/600x400/png?text=Garmin+Fenix',
    },
    {
      name: 'Anker 737 Power Bank',
      description: 'Ultra-powerful two-way charging. 24,000mAh capacity.',
      price: 149,
      stock: 200,
      categoryName: 'Accessories',
      image: 'https://placehold.co/600x400/png?text=Anker+Power+Bank',
    },
    {
      name: 'Logitech MX Master 3S',
      description: 'An icon remastered. Quiet clicks and 8K DPI tracking.',
      price: 99,
      stock: 80,
      categoryName: 'Accessories',
      image: 'https://placehold.co/600x400/png?text=Logitech+Mouse',
    },
  ];

  for (const prod of productsData) {
    const category = categories.find((c) => c.name === prod.categoryName);
    if (!category) continue;

    const existingProduct = await prisma.product.findFirst({
      where: { name: prod.name },
    });

    if (!existingProduct) {
      const product = await prisma.product.create({
        data: {
          name: prod.name,
          description: prod.description,
          price: prod.price,
          stock: prod.stock,
          categoryId: category.id,
          productImages: {
            create: {
              url: prod.image,
            },
          },
        },
      });
      console.log(`Created product: ${product.name}`);

      if (faker.datatype.boolean({ probability: 0.3 })) {
        await prisma.discount.create({
          data: {
            value: faker.number.int({ min: 5, max: 25 }),
            startDate: faker.date.recent(),
            endDate: faker.date.future(),
            isActive: true,
            productId: product.id,
          },
        });
        console.log(`Added discount to ${product.name}`);
      }
    } else {
      console.log(`Product ${prod.name} already exists, skipping.`);
    }
  }

  console.log('Creating promocodes...');
  for (let i = 0; i < 5; i++) {
    const code = faker.string.alphanumeric({ length: 8, casing: 'upper' });
    const existing = await prisma.promocode.findUnique({ where: { code } });
    if (!existing) {
      await prisma.promocode.create({
        data: {
          code,
          value: faker.number.int({ min: 5, max: 20 }),
          minOrderAmount: faker.number.int({ min: 50, max: 200 }),
          maxUsage: faker.number.int({ min: 10, max: 100 }),
          isActive: true,
        },
      });
    }
  }

  console.log('Created 5 promocodes');

  // 4. Users & Orders
  console.log('Checking users...');
  const users = await prisma.user.findMany();
  if (users.length === 0) {
    console.log('No users found. Creating a demo user...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        email: 'demo@example.com',
        password: hashedPassword,
        firstName: 'Demo',
        lastName: 'User',
        phone: '+1234567890',
        address: '123 Demo St, Demo City',
        role: 'USER',
      },
    });
    users.push(user);
    console.log('Created demo user: demo@example.com');
  }

  console.log('Generating orders...');
  const allProducts = await prisma.product.findMany();

  if (allProducts.length > 0 && users.length > 0) {
    for (let i = 0; i < 20; i++) {
      const user = faker.helpers.arrayElement(users);
      const numItems = faker.number.int({ min: 1, max: 5 });
      const orderItemsData: { productId: string; quantity: number; price: number }[] = [];
      let totalAmount = 0;

      for (let j = 0; j < numItems; j++) {
        const product = faker.helpers.arrayElement(allProducts);
        const quantity = faker.number.int({ min: 1, max: 3 });
        const price = product.price;

        orderItemsData.push({
          productId: product.id,
          quantity,
          price,
        });
        totalAmount += price * quantity;
      }

      const status = faker.helpers.enumValue(OrderStatus);

      await prisma.order.create({
        data: {
          userId: user.id,
          status: status,
          totalAmount: totalAmount,
          orderItems: {
            create: orderItemsData,
          },
          delivery: {
            create: {
              address: user.address || faker.location.streetAddress(),
              email: user.email,
              phone: user.phone || faker.phone.number(),
              method: faker.helpers.enumValue(DeliveryMethod),
            },
          },
        },
      });
    }
    console.log('Created 20 orders');
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
