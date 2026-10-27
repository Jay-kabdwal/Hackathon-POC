CREATE TABLE "JudgeTeamAssignment" (
    "id" TEXT NOT NULL,
    "judgeId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "JudgeTeamAssignment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuthSession" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "JudgeTeamAssignment_judgeId_teamId_key" ON "JudgeTeamAssignment"("judgeId", "teamId");
CREATE INDEX "JudgeTeamAssignment_teamId_idx" ON "JudgeTeamAssignment"("teamId");
CREATE INDEX "AuthSession_subjectId_role_idx" ON "AuthSession"("subjectId", "role");
CREATE INDEX "AuthSession_expiresAt_idx" ON "AuthSession"("expiresAt");

ALTER TABLE "JudgeTeamAssignment" ADD CONSTRAINT "JudgeTeamAssignment_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "Judge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JudgeTeamAssignment" ADD CONSTRAINT "JudgeTeamAssignment_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "JudgeTeamAssignment" ("id", "judgeId", "teamId")
SELECT 'assignment_' || md5(j."id" || ':' || t."id"), j."id", t."id"
FROM "Judge" j CROSS JOIN "Team" t
ON CONFLICT ("judgeId", "teamId") DO NOTHING;
