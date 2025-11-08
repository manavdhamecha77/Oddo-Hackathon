-- AlterTable
ALTER TABLE "expenses" ADD COLUMN     "is_billed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "timesheets" ADD COLUMN     "is_billed" BOOLEAN NOT NULL DEFAULT false;
