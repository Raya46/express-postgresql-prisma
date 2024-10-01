/*
  Warnings:

  - You are about to drop the column `user_id` on the `Chat` table. All the data in the column will be lost.
  - Added the required column `receiver_id` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sender_id` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_user_id_fkey";

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "user_id",
ADD COLUMN     "receiver_id" INTEGER NOT NULL,
ADD COLUMN     "sender_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
