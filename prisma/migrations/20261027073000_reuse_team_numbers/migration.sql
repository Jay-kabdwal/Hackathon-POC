-- Preserve all existing team numbers while moving allocation into the
-- application transaction so deleted numbers can be reused.
ALTER TABLE "Team" ALTER COLUMN "teamNumber" DROP DEFAULT;
