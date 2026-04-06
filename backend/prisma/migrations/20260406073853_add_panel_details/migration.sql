-- AlterTable
ALTER TABLE "panels" ADD COLUMN     "catalog_url" TEXT,
ADD COLUMN     "depth_relief_mm" INTEGER,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "images" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "material" TEXT;
