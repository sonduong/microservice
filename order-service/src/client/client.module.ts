import { Module, Global } from '@nestjs/common';
import { ClientProxyFactory } from '@nestjs/microservices';
import { ConfigService } from '../config/config.service';
import { ORDER_MGMT_MQ } from '../shared/constants';

@Global()
@Module({
  providers: [
    ConfigService,
    {
      provide: ORDER_MGMT_MQ,
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create(configService.redisConfig);
      },
      inject: [ConfigService],
    }],
  exports: [ORDER_MGMT_MQ],
})
export class ClientModule {}
