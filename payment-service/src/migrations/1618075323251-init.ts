import { MigrationInterface, QueryRunner } from 'typeorm';

// tslint:disable-next-line:class-name
export class init1618075323251 implements MigrationInterface {
  name = 'init1618075323251';

  public async up(queryRunner: QueryRunner): Promise<any> {
    // tslint:disable-next-line:max-line-length
    await queryRunner.query('CREATE TABLE `payment` (`id` bigint NOT NULL AUTO_INCREMENT, `order_id` bigint NOT NULL, `user_id` bigint NOT NULL, `transaction_id` varchar(50) NOT NULL, `amount` double NOT NULL DEFAULT 0, `status` enum (\'declined\', \'confirmed\') NOT NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX `IDX_82c3470854cf4642dfb0d7150c` (`transaction_id`), PRIMARY KEY (`id`)) ENGINE=InnoDB', undefined);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query('DROP INDEX `IDX_82c3470854cf4642dfb0d7150c` ON `payment`', undefined);
    await queryRunner.query('DROP TABLE `payment`', undefined);
  }

}
