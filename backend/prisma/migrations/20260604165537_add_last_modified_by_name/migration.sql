-- AlterTable
ALTER TABLE `customer` ADD COLUMN `lastModifiedByName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `product` ADD COLUMN `lastModifiedByName` VARCHAR(191) NULL;
