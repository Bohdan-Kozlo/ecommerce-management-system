import {
  PrismaClient,
  Category,
  Product,
  User,
  Role,
  OrderStatus,
  DeliveryMethod,
} from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  console.log('Clearing existing data...');
  await prisma.orderItem.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.discount.deleteMany();
  await prisma.promocode.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log('Creating users...');
  const users: User[] = [];
  const hashedPassword = await bcrypt.hash('password123', 10);

  const adminUser = (await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: faker.phone.number(),
      address: faker.location.streetAddress(true),
      role: Role.ADMIN,
    },
  })) as User;
  users.push(adminUser);

  for (let i = 0; i < 10; i++) {
    const user = (await prisma.user.create({
      data: {
        email: faker.internet.email(),
        password: hashedPassword,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(true),
        role: Role.USER,
      },
    })) as User;
    users.push(user);
  }
  console.log(`Created ${users.length} users`);

  console.log('Creating categories...');
  const categoryNames = [
    'Electronics',
    'Clothing',
    'Books',
    'Home & Garden',
    'Sports & Outdoors',
    'Toys & Games',
    'Food & Beverages',
    'Health & Beauty',
  ];
  const categories: Category[] = [];
  for (const name of categoryNames) {
    const category = (await prisma.category.create({
      data: {
        name,
        description: faker.lorem.sentence(),
      },
    })) as Category;
    categories.push(category);
  }
  console.log(`Created ${categories.length} categories`);

  console.log('Creating products...');
  const products: Product[] = [];
  for (let i = 0; i < 50; i++) {
    const product = (await prisma.product.create({
      data: {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
        stock: faker.number.int({ min: 0, max: 100 }),
        categoryId: faker.helpers.arrayElement(categories).id,
      },
    })) as Product;
    products.push(product);
  }
  console.log(`Created ${products.length} products`);

  console.log('Creating product images...');
  let imageCount = 0;
  for (const product of products) {
    const numImages = faker.number.int({ min: 1, max: 4 });
    for (let i = 0; i < numImages; i++) {
      await prisma.productImage.create({
        data: {
          url: faker.image.url({ width: 640, height: 480 }),
          productId: product.id,
        },
      });
      imageCount++;
    }
  }
  console.log(`Created ${imageCount} product images`);

  console.log('Creating promocodes...');
  const promocodes: { id: string; code: string; value: number }[] = [];
  for (let i = 0; i < 5; i++) {
    const promocode = await prisma.promocode.create({
      data: {
        code: faker.string.alphanumeric({ length: 8, casing: 'upper' }),
        value: faker.number.int({ min: 5, max: 50 }),
        minOrderAmount: faker.number.float({ min: 50, max: 200, fractionDigits: 2 }),
        maxUsage: faker.number.int({ min: 10, max: 100 }),
        usedCount: faker.number.int({ min: 0, max: 5 }),
        isActive: faker.datatype.boolean({ probability: 0.8 }),
      },
    });
    promocodes.push(promocode);
  }
  console.log(`Created ${promocodes.length} promocodes`);

  console.log('Creating discounts...');
  const discountProducts = faker.helpers.arrayElements(products, 15);
  let discountCount = 0;
  for (const product of discountProducts) {
    await prisma.discount.create({
      data: {
        value: faker.number.int({ min: 5, max: 50 }),
        startDate: faker.date.past(),
        endDate: faker.date.future(),
        isActive: faker.datatype.boolean({ probability: 0.7 }),
        productId: product.id,
      },
    });
    discountCount++;
  }
  console.log(`Created ${discountCount} discounts`);

  // Create carts
  console.log('Creating carts...');
  const carts: { id: string; userId: string }[] = [];
  for (const user of users.slice(1, 6)) {
    const cart = await prisma.cart.create({
      data: {
        userId: user.id,
      },
    });
    carts.push(cart);
  }
  console.log(`Created ${carts.length} carts`);

  console.log('Creating cart items...');
  let cartItemCount = 0;
  for (const cart of carts) {
    const numItems = faker.number.int({ min: 1, max: 5 });
    const selectedProducts = faker.helpers.arrayElements(products, numItems);
    for (const product of selectedProducts) {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          quantity: faker.number.int({ min: 1, max: 5 }),
        },
      });
      cartItemCount++;
    }
  }
  console.log(`Created ${cartItemCount} cart items`);

  console.log('Creating orders...');
  const orders: { id: string; status: OrderStatus; userId: string; totalAmount: number }[] = [];
  const orderStatuses = [
    OrderStatus.PENDING,
    OrderStatus.PAID,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
    OrderStatus.CANCELED,
  ];
  for (const user of users.slice(1)) {
    const numOrders = faker.number.int({ min: 0, max: 3 });
    for (let i = 0; i < numOrders; i++) {
      const usePromocode = faker.datatype.boolean({ probability: 0.3 });
      const order = await prisma.order.create({
        data: {
          status: faker.helpers.arrayElement(orderStatuses),
          userId: user.id,
          totalAmount: faker.number.float({ min: 50, max: 1000, fractionDigits: 2 }),
          promocodeId: usePromocode ? faker.helpers.arrayElement(promocodes).id : undefined,
        },
      });
      orders.push(order);
    }
  }
  console.log(`Created ${orders.length} orders`);

  console.log('Creating order items...');
  let orderItemCount = 0;
  for (const order of orders) {
    const numItems = faker.number.int({ min: 1, max: 5 });
    const selectedProducts = faker.helpers.arrayElements(products, numItems);
    for (const product of selectedProducts) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: product.id,
          quantity: faker.number.int({ min: 1, max: 3 }),
          price: parseFloat(product.price.toString()),
        },
      });
      orderItemCount++;
    }
  }
  console.log(`Created ${orderItemCount} order items`);

  console.log('Creating deliveries...');
  const deliveryMethods = [
    DeliveryMethod.COUIRIER,
    DeliveryMethod.LOCKER,
    DeliveryMethod.DEPARTMENT,
  ];
  let deliveryCount = 0;
  for (const order of orders) {
    await prisma.delivery.create({
      data: {
        orderId: order.id,
        address: faker.location.streetAddress(true),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        method: faker.helpers.arrayElement(deliveryMethods),
      },
    });
    deliveryCount++;
  }
  console.log(`Created ${deliveryCount} deliveries`);
}

main()
  .catch((e: Error) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
