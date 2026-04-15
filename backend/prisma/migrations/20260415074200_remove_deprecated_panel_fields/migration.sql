-- Remove deprecated Panel fields (replaced by PanelImage relation + zip_url)
ALTER TABLE "panels" DROP COLUMN IF EXISTS "sku";
ALTER TABLE "panels" DROP COLUMN IF EXISTS "texture_url";
ALTER TABLE "panels" DROP COLUMN IF EXISTS "thumb_url";
ALTER TABLE "panels" DROP COLUMN IF EXISTS "model_url";
ALTER TABLE "panels" DROP COLUMN IF EXISTS "catalog_url";
ALTER TABLE "panels" DROP COLUMN IF EXISTS "images";
