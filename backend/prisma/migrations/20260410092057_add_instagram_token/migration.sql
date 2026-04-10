-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "instagram_access_token" TEXT,
ADD COLUMN     "instagram_token_expiry" TIMESTAMP(3),
ADD COLUMN     "instagram_user_id" TEXT;
