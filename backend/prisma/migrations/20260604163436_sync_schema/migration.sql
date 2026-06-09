-- AlterTable
ALTER TABLE `customer` ADD COLUMN `lastUpdatedById` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `product` ADD COLUMN `lastUpdatedById` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `sale` ADD COLUMN `customerAddress` VARCHAR(191) NULL,
    ADD COLUMN `customerEmail` VARCHAR(191) NULL,
    ADD COLUMN `customerLastName` VARCHAR(191) NULL,
    ADD COLUMN `customerName` VARCHAR(191) NULL,
    ADD COLUMN `customerPhone` VARCHAR(191) NULL,
    ADD COLUMN `sellerName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `lastUpdatedById` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Customer_isActive_lastName_idx` ON `Customer`(`isActive`, `lastName`);

-- CreateIndex
CREATE INDEX `Product_isActive_name_idx` ON `Product`(`isActive`, `name`);

-- CreateIndex
CREATE INDEX `Sale_customerName_idx` ON `Sale`(`customerName`);

-- CreateIndex
CREATE INDEX `Sale_customerLastName_idx` ON `Sale`(`customerLastName`);

-- CreateIndex
CREATE INDEX `User_isActive_username_idx` ON `User`(`isActive`, `username`);

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_lastUpdatedById_fkey` FOREIGN KEY (`lastUpdatedById`) REFERENCES `User`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Customer` ADD CONSTRAINT `Customer_lastUpdatedById_fkey` FOREIGN KEY (`lastUpdatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_lastUpdatedById_fkey` FOREIGN KEY (`lastUpdatedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
