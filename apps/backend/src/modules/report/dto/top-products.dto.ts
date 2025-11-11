import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ReportPeriodDto } from './report-period.dto';

export class TopProductsDto extends ReportPeriodDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
