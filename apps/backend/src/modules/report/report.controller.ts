import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportPeriodDto } from './dto/report-period.dto';
import { TopProductsDto } from './dto/top-products.dto';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { AccessJwtGuard } from 'src/common/guards/acessJwt.guard';

@Controller('reports')
@UseGuards(AccessJwtGuard, AdminGuard)
export class ReportController {
  constructor(private reportService: ReportService) {}

  @Get('revenue')
  revenue(@Query() q: ReportPeriodDto) {
    return this.reportService.revenue(q.from, q.to);
  }

  @Get('sales-by-category')
  salesByCategory(@Query() q: ReportPeriodDto) {
    return this.reportService.salesByCategory(q.from, q.to);
  }

  @Get('top-products')
  topProducts(@Query() q: TopProductsDto) {
    return this.reportService.topProducts(q.from, q.to, q.limit);
  }
}
