import { MigrationInterface, QueryRunner } from 'typeorm';

// tslint:disable-next-line:class-name
export class init1618047741545 implements MigrationInterface {
  name = 'init1618047741545';

  public async up(queryRunner: QueryRunner): Promise<any> {
    // tslint:disable-next-line:max-line-length
    await queryRunner.query('CREATE TABLE `order` (`id` bigint NOT NULL AUTO_INCREMENT, `amount` double NOT NULL DEFAULT 0, `status` enum (\'created\', \'confirmed\', \'delivered\', \'canceled\') NOT NULL DEFAULT \'created\', `user_id` bigint NOT NULL, `transaction_id` varchar(50) NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB', undefined);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP TABLE `order`', undefined);
  }

}
