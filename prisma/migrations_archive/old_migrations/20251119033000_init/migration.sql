-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchlistItem" (
    "userId" INTEGER NOT NULL,
    "imdbId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "poster" TEXT,
    "year" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "rated" TEXT,
    "genre" TEXT NOT NULL,
    "plot" TEXT NOT NULL,
    "director" TEXT NOT NULL,
    "actors" TEXT NOT NULL,
    "imdbRaw" TEXT,
    "rtRaw" TEXT,
    "mcRaw" TEXT,
    "imdbScore" DOUBLE PRECISION,
    "rtScore" INTEGER,
    "mcScore" INTEGER,
    "sortScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WatchlistItem_pkey" PRIMARY KEY ("userId","imdbId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "WatchlistItem_userId_createdAt_idx" ON "WatchlistItem"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "WatchlistItem_userId_imdbScore_idx" ON "WatchlistItem"("userId", "imdbScore");

-- CreateIndex
CREATE INDEX "WatchlistItem_userId_rtScore_idx" ON "WatchlistItem"("userId", "rtScore");

-- CreateIndex
CREATE INDEX "WatchlistItem_userId_mcScore_idx" ON "WatchlistItem"("userId", "mcScore");

-- CreateIndex
CREATE INDEX "WatchlistItem_userId_sortScore_idx" ON "WatchlistItem"("userId", "sortScore");

-- AddForeignKey
ALTER TABLE "WatchlistItem" ADD CONSTRAINT "WatchlistItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
