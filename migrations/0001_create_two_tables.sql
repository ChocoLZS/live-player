-- CreateTable
CREATE TABLE "players" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "p_id" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "cover_url" TEXT,
    "announcement" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "players_p_id_key" ON "players"("p_id");
