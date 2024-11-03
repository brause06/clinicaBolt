import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddDeletedColumnToNotifications implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "notification",
            new TableColumn({
                name: "deleted",
                type: "boolean",
                default: false
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("notification", "deleted");
    }
}
