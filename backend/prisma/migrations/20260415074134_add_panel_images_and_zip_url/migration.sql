-- AlterTable
ALTER TABLE "panels" ADD COLUMN     "zip_url" TEXT;

-- CreateTable
CREATE TABLE "panel_images" (
    "id" TEXT NOT NULL,
    "panel_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "panel_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "panel_images_panel_id_idx" ON "panel_images"("panel_id");

-- AddForeignKey
ALTER TABLE "panel_images" ADD CONSTRAINT "panel_images_panel_id_fkey" FOREIGN KEY ("panel_id") REFERENCES "panels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
