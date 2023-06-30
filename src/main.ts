import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import * as momentTimezone from 'moment-timezone'
import { format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter())

  // com moment
  // Date.prototype.toJSON = function(): any {
  //   return momentTimezone(this)
  //     .tz('America/Sao_Paulo')
  //     .format('YYYY-MM-DD HH:mm:ss.SSS')
  // }

  // com date-fns
  Date.prototype.toJSON = function(): any {
    return format(utcToZonedTime(this, 'America/Sao_Paulo'), 'yyyy-MM-dd HH:mm:ss.SSS')
  }

  await app.listen(8080);
}
bootstrap();
