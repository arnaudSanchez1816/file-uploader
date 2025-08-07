-- DropForeignKey
ALTER TABLE "file_uploader"."files" DROP CONSTRAINT "files_parent_id_fkey";

-- AddForeignKey
ALTER TABLE "file_uploader"."files" ADD CONSTRAINT "files_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "file_uploader"."files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
