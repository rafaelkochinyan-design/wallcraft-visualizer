-- AlterTable
ALTER TABLE "panels" ADD COLUMN     "model_url" TEXT,
ALTER COLUMN "texture_url" DROP NOT NULL;
