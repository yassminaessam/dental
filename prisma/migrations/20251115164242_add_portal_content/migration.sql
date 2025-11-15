-- CreateTable
CREATE TABLE "PortalContent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT,
    "content" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortalContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PortalContent_type_idx" ON "PortalContent"("type");

-- CreateIndex
CREATE INDEX "PortalContent_active_idx" ON "PortalContent"("active");
