/*
  Warnings:

  - You are about to drop the `File` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "file_uploader"."FileType" AS ENUM ('FILE', 'FOLDER');

-- DropForeignKey
ALTER TABLE "file_uploader"."File" DROP CONSTRAINT "File_owner_id_fkey";

-- DropTable
DROP TABLE "file_uploader"."File";

-- DropTable
DROP TABLE "file_uploader"."Session";

-- DropTable
DROP TABLE "file_uploader"."User";

-- CreateTable
CREATE TABLE "file_uploader"."sessions" (
    "id" TEXT NOT NULL,
    "sid" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_uploader"."users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_uploader"."files" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "type" "file_uploader"."FileType" NOT NULL DEFAULT 'FOLDER',
    "owner_id" INTEGER NOT NULL,
    "parent_id" INTEGER,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sid_key" ON "file_uploader"."sessions"("sid");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "file_uploader"."users"("email");

-- AddForeignKey
ALTER TABLE "file_uploader"."files" ADD CONSTRAINT "files_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "file_uploader"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_uploader"."files" ADD CONSTRAINT "files_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "file_uploader"."files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
