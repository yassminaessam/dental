-- CreateEnum
CREATE TYPE "ChatConversationStatus" AS ENUM ('Active', 'Closed', 'Archived');

-- CreateTable
CREATE TABLE "ChatConversation" (
    "id" TEXT NOT NULL,
    "patientId" TEXT,
    "patientName" TEXT NOT NULL,
    "patientEmail" TEXT,
    "staffId" TEXT,
    "staffName" TEXT,
    "status" "ChatConversationStatus" NOT NULL DEFAULT 'Active',
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderType" TEXT NOT NULL,
    "senderId" TEXT,
    "senderName" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatConversation_status_idx" ON "ChatConversation"("status");

-- CreateIndex
CREATE INDEX "ChatConversation_patientId_idx" ON "ChatConversation"("patientId");

-- CreateIndex
CREATE INDEX "ChatConversation_staffId_idx" ON "ChatConversation"("staffId");

-- CreateIndex
CREATE INDEX "ChatConversation_lastMessageAt_idx" ON "ChatConversation"("lastMessageAt");

-- CreateIndex
CREATE INDEX "ChatMessage_conversationId_idx" ON "ChatMessage"("conversationId");

-- CreateIndex
CREATE INDEX "ChatMessage_isRead_idx" ON "ChatMessage"("isRead");

-- CreateIndex
CREATE INDEX "ChatMessage_createdAt_idx" ON "ChatMessage"("createdAt");

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ChatConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
