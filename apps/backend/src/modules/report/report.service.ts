import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async topProducts(from: string | undefined, to: string | undefined, limit: number | undefined) {
    const fromDate = from ? new Date(from) : new Date(0);
    const toDate = to ? new Date(to) : new Date();
    const productsLimit = limit || 10;

    try {
      const topProducts = await this.prisma.$queryRaw<
        {
          productId: string;
          productName: string;
          totalQuantitySold: bigint;
          totalRevenue: number;
          ordersCount: bigint;
          imageUrl: string | null;
        }[]
      >(
        Prisma.sql`
          SELECT 
            p.id as "productId",
            p.name as "productName",
            SUM(oi.quantity)::bigint as "totalQuantitySold",
            SUM(oi.price * oi.quantity) as "totalRevenue",
            COUNT(DISTINCT o.id)::bigint as "ordersCount",
            (SELECT pi.url FROM product_images pi WHERE pi."productId" = p.id LIMIT 1) as "imageUrl"
          FROM order_items oi
          INNER JOIN orders o ON oi."orderId" = o.id
          INNER JOIN products p ON oi."productId" = p.id
          WHERE o.status IN ('PAID', 'SHIPPED', 'DELIVERED')
            AND o."createdAt" >= ${fromDate}
            AND o."createdAt" <= ${toDate}
          GROUP BY p.id, p.name
          ORDER BY "totalQuantitySold" DESC
          LIMIT ${productsLimit}
        `,
      );

      return topProducts.map((product) => ({
        productId: product.productId,
        productName: product.productName,
        totalQuantitySold: Number(product.totalQuantitySold),
        totalRevenue: Number(product.totalRevenue),
        ordersCount: Number(product.ordersCount),
        imageUrl: product.imageUrl,
      }));
    } catch (error) {
      console.error('Error fetching top products:', error);
      throw new Error('Failed to fetch top products report');
    }
  }

  async salesByCategory(from: string | undefined, to: string | undefined) {
    const fromDate = from ? new Date(from) : new Date(0);
    const toDate = to ? new Date(to) : new Date();

    try {
      const salesData = await this.prisma.$queryRaw<
        {
          categoryId: string;
          categoryName: string;
          totalRevenue: number | null;
          totalItemsSold: bigint | null;
          totalOrders: bigint | null;
          averageOrderValue: number | null;
        }[]
      >(
        Prisma.sql`
          SELECT 
            c.id as "categoryId",
            c.name as "categoryName",
            COALESCE(SUM(oi.price * oi.quantity), 0) as "totalRevenue",
            COALESCE(SUM(oi.quantity), 0)::bigint as "totalItemsSold",
            COUNT(DISTINCT CASE WHEN o.id IS NOT NULL THEN o.id END)::bigint as "totalOrders",
            COALESCE(AVG(oi.price * oi.quantity), 0) as "averageOrderValue"
          FROM categories c
          LEFT JOIN products p ON p."categoryId" = c.id
          LEFT JOIN order_items oi ON oi."productId" = p.id
          LEFT JOIN orders o ON oi."orderId" = o.id 
            AND o.status IN ('PAID', 'SHIPPED', 'DELIVERED')
            AND o."createdAt" >= ${fromDate}
            AND o."createdAt" <= ${toDate}
          GROUP BY c.id, c.name
          ORDER BY "totalRevenue" DESC
        `,
      );

      return salesData.map((category) => ({
        categoryId: category.categoryId,
        categoryName: category.categoryName,
        totalRevenue: Number(category.totalRevenue || 0),
        totalItemsSold: Number(category.totalItemsSold || 0),
        totalOrders: Number(category.totalOrders || 0),
        averageOrderValue: Number(category.averageOrderValue || 0),
      }));
    } catch (error) {
      console.error('Error fetching sales by category:', error);
      throw new Error('Failed to fetch sales by category report');
    }
  }

  async revenue(from: string | undefined, to: string | undefined) {
    const fromDate = from ? new Date(from) : new Date(0);
    const toDate = to ? new Date(to) : new Date();

    try {
      const totalStats = await this.prisma.$queryRaw<
        {
          totalRevenue: number;
          totalOrders: bigint;
          averageOrderValue: number;
        }[]
      >(
        Prisma.sql`
          SELECT 
            SUM(o."totalAmount") as "totalRevenue",
            COUNT(o.id)::bigint as "totalOrders",
            AVG(o."totalAmount") as "averageOrderValue"
          FROM orders o
          WHERE o.status IN ('PAID', 'SHIPPED', 'DELIVERED')
            AND o."createdAt" >= ${fromDate}
            AND o."createdAt" <= ${toDate}
        `,
      );

      const revenueByDate = await this.prisma.$queryRaw<
        {
          date: Date;
          revenue: number;
          ordersCount: bigint;
        }[]
      >(
        Prisma.sql`
          SELECT 
            DATE(o."createdAt") as "date",
            SUM(o."totalAmount") as "revenue",
            COUNT(o.id)::bigint as "ordersCount"
          FROM orders o
          WHERE o.status IN ('PAID', 'SHIPPED', 'DELIVERED')
            AND o."createdAt" >= ${fromDate}
            AND o."createdAt" <= ${toDate}
          GROUP BY DATE(o."createdAt")
          ORDER BY "date" ASC
        `,
      );

      const stats = totalStats[0];

      return {
        totalRevenue: Number(stats?.totalRevenue || 0),
        totalOrders: Number(stats?.totalOrders || 0),
        averageOrderValue: Number(stats?.averageOrderValue || 0),
        revenueByDate: revenueByDate.map((item) => ({
          date: item.date.toISOString().split('T')[0],
          revenue: Number(item.revenue),
          ordersCount: Number(item.ordersCount),
        })),
      };
    } catch (error) {
      console.error('Error fetching revenue report:', error);
      throw new Error('Failed to fetch revenue report');
    }
  }
}
