-- CreateTable
CREATE TABLE "file_uploader"."Session" (
    "id" TEXT NOT NULL,
    "sid" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_uploader"."User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_uploader"."File" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "uploaded_at" TIMESTAMPTZ NOT NULL,
    "owner_id" INTEGER NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_sid_key" ON "file_uploader"."Session"("sid");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "file_uploader"."User"("email");

-- AddForeignKey
ALTER TABLE "file_uploader"."File" ADD CONSTRAINT "File_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "file_uploader"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
