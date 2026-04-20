-- Ensure memo_number is unique in approval_memos.
-- Safe to run on DBs that already have the index (migrate.js ignores "already exists" errors).

ALTER TABLE `approval_memos`
  ADD UNIQUE INDEX `idx_memo_number_unique` (`memo_number`);
