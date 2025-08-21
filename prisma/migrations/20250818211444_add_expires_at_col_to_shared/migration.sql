/*
  Warnings:

  - You are about to drop the column `created_at` on the `shared_files` table. All the data in the column will be lost.
  - Added the required column `expires_at` to the `shared_files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "file_uploader"."shared_files" DROP COLUMN "created_at",
ADD COLUMN     "expires_at" TIMESTAMPTZ NOT NULL;
