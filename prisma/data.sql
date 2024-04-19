PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "firstname" TEXT,
    "lastname" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO User VALUES('d27a197e','JohnDoe@gmail.com','jdoe_1','John','Doe',1713280495881,1713280495881);
INSERT INTO User VALUES('e25d497e','SallySmith@gmail.com','foxy_cleo','Sally','Smith',1713280495894,1713280495894);
CREATE TABLE IF NOT EXISTS "Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "likes" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "gamePostId" TEXT NOT NULL,
    "parentCommentId" TEXT,
    CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_gamePostId_fkey" FOREIGN KEY ("gamePostId") REFERENCES "GamePost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "Comment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "UserImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "altText" TEXT,
    "contentType" TEXT NOT NULL,
    "blob" BLOB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "UserImage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "GamePost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO GamePost VALUES('clv1rxxek0000119a2w7l078f','1234',1713235097181,1713235091272);
CREATE TABLE IF NOT EXISTS "UserGameRating" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "gamePostId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "UserGameRating_gamePostId_fkey" FOREIGN KEY ("gamePostId") REFERENCES "GamePost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserGameRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "_LikedCommentsByUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_LikedCommentsByUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Comment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_LikedCommentsByUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "_FavoritedGamesByUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_FavoritedGamesByUser_A_fkey" FOREIGN KEY ("A") REFERENCES "GamePost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_FavoritedGamesByUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "Comment_userId_key" ON "Comment"("userId");
CREATE UNIQUE INDEX "Comment_gamePostId_key" ON "Comment"("gamePostId");
CREATE UNIQUE INDEX "UserImage_userId_key" ON "UserImage"("userId");
CREATE UNIQUE INDEX "GamePost_gameId_key" ON "GamePost"("gameId");
CREATE UNIQUE INDEX "UserGameRating_userId_gamePostId_key" ON "UserGameRating"("userId", "gamePostId");
CREATE UNIQUE INDEX "_LikedCommentsByUser_AB_unique" ON "_LikedCommentsByUser"("A", "B");
CREATE INDEX "_LikedCommentsByUser_B_index" ON "_LikedCommentsByUser"("B");
CREATE UNIQUE INDEX "_FavoritedGamesByUser_AB_unique" ON "_FavoritedGamesByUser"("A", "B");
CREATE INDEX "_FavoritedGamesByUser_B_index" ON "_FavoritedGamesByUser"("B");
COMMIT;
