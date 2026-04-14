-- CreateTable
CREATE TABLE "panel_sizes" (
    "id" TEXT NOT NULL,
    "panel_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "width_mm" DOUBLE PRECISION NOT NULL,
    "height_mm" DOUBLE PRECISION NOT NULL,
    "depth_mm" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "panel_sizes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "panel_sizes" ADD CONSTRAINT "panel_sizes_panel_id_fkey" FOREIGN KEY ("panel_id") REFERENCES "panels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
