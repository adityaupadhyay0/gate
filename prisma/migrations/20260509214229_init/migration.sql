/*
  Warnings:

  - You are about to drop the column `difficulty` on the `PYQMetadata` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "TopicDependency" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "topicId" TEXT NOT NULL,
    "prerequisiteId" TEXT NOT NULL,
    CONSTRAINT "TopicDependency_prerequisiteId_fkey" FOREIGN KEY ("prerequisiteId") REFERENCES "Topic" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TopicDependency_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Attempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "pyqId" TEXT NOT NULL,
    "userAnswer" TEXT,
    "isCorrect" BOOLEAN NOT NULL,
    "timeSpent" INTEGER NOT NULL,
    "stability" REAL NOT NULL DEFAULT 0,
    "difficulty" REAL NOT NULL DEFAULT 0,
    "retrievability" REAL NOT NULL DEFAULT 1.0,
    "memoryScore" REAL NOT NULL DEFAULT 1.0,
    "personalDifficulty" REAL NOT NULL DEFAULT 0.5,
    "confidenceLevel" INTEGER,
    "attemptedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Attempt_pyqId_fkey" FOREIGN KEY ("pyqId") REFERENCES "PYQ" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Attempt" ("attemptedAt", "id", "isCorrect", "memoryScore", "pyqId", "timeSpent", "userAnswer", "userId") SELECT "attemptedAt", "id", "isCorrect", "memoryScore", "pyqId", "timeSpent", "userAnswer", "userId" FROM "Attempt";
DROP TABLE "Attempt";
ALTER TABLE "new_Attempt" RENAME TO "Attempt";
CREATE TABLE "new_PYQMetadata" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pyqId" TEXT NOT NULL,
    "subtopic" TEXT,
    "conceptTags" TEXT,
    "globalDifficulty" REAL NOT NULL DEFAULT 0.5,
    "questionType" TEXT,
    "commonMistake" TEXT,
    "oneLineExplanation" TEXT,
    "precomputedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PYQMetadata_pyqId_fkey" FOREIGN KEY ("pyqId") REFERENCES "PYQ" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PYQMetadata" ("commonMistake", "conceptTags", "id", "oneLineExplanation", "precomputedAt", "pyqId", "questionType", "subtopic") SELECT "commonMistake", "conceptTags", "id", "oneLineExplanation", "precomputedAt", "pyqId", "questionType", "subtopic" FROM "PYQMetadata";
DROP TABLE "PYQMetadata";
ALTER TABLE "new_PYQMetadata" RENAME TO "PYQMetadata";
CREATE UNIQUE INDEX "PYQMetadata_pyqId_key" ON "PYQMetadata"("pyqId");
CREATE TABLE "new_TopicResource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "topicId" TEXT NOT NULL,
    "bestYoutubeChannels" TEXT,
    "recommendedBookChapters" TEXT,
    "notesKeywords" TEXT,
    "learningGain" REAL NOT NULL DEFAULT 0,
    "totalTimeSpent" INTEGER NOT NULL DEFAULT 0,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "precomputedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TopicResource_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TopicResource" ("bestYoutubeChannels", "id", "notesKeywords", "precomputedAt", "recommendedBookChapters", "topicId") SELECT "bestYoutubeChannels", "id", "notesKeywords", "precomputedAt", "recommendedBookChapters", "topicId" FROM "TopicResource";
DROP TABLE "TopicResource";
ALTER TABLE "new_TopicResource" RENAME TO "TopicResource";
CREATE UNIQUE INDEX "TopicResource_topicId_key" ON "TopicResource"("topicId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "TopicDependency_topicId_prerequisiteId_key" ON "TopicDependency"("topicId", "prerequisiteId");
