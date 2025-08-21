-- CreateTable
CREATE TABLE "file_uploader"."shared_files" (
    "id" TEXT NOT NULL,
    "file_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shared_files_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "file_uploader"."shared_files" ADD CONSTRAINT "shared_files_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "file_uploader"."files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
