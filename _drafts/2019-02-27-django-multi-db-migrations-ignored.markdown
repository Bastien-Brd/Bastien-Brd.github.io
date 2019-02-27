---
title:  "Django ignores migrations in multi db setup"
date:   2019-02-27
categories: [general]
tags: [general]
---

- 2 Django databases : DB1 (default) and DB2
- One django app app_2 with one model ModelForDB2Only
- One DATABASE_ROUTER making sure all models are saved and migrated and retrived from default db (DB1) except for all models from app_2 that must be migrated into DB2 only and read and written from DB2 only as well
- Run migrations on default db: `manage.py migrate`:
   - It does look like it applies the app_2 migration, but actually the DATABASE_ROUTER forbids the migration to actually be applied
   - Django now (wringly) remembers that the app_2 migration has been applied (although no change have actually been made to any database)
- Then run migration for DB2 `manage.py migrate --database=DB2`:
   - Django should now actually apply the app_2 migration to the DB2, but hte problem is Django thinks this migration file has already been applied... which is wrong: it only processed it and decided ther ewas no change to make, but it did not actually apply it...
- Solution: change the order in which you apply the migrations, by explicitly applying the migrations to DB2 first for app_2 specifically:
   - `manage.py migrate app_2 --database=DB2`
   - `manage.py migrate`

---
