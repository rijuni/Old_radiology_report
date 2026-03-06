"""
Cleanup Script v2: 
- Checks each patient's report_path against the new unified folder structure:
  media/Reports/KIMSTELERAD/<DD-MM-YYYY>/<uid>/reports/<file>
- Sets report_path = NULL for any record where the file doesn't exist on disk.

Run: python cleanup_missing_reports_v2.py
"""

import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.conf import settings
from api.models import Patient

REPORTS_BASE = os.path.join(settings.MEDIA_ROOT, 'Reports')

print(f"\n[INFO] Using reports base: {REPORTS_BASE}")
print("[INFO] Building filename index from disk (this may take a minute)...\n")

# Build a set of all filenames on disk for fast lookup fallback
all_disk_filenames = set()
for root_dir, dirs, files in os.walk(REPORTS_BASE):
    for f in files:
        all_disk_filenames.add(f)

print(f"[INFO] Total files indexed on disk: {len(all_disk_filenames)}\n")

patients_with_path = Patient.objects.filter(report_path__isnull=False).exclude(report_path='')
total = patients_with_path.count()
print(f"[INFO] Total patients with a report_path in DB: {total}\n")

missing_ids = []
found_count = 0

for patient in patients_with_path.iterator():
    # Strategy 1: Direct path check (fast)
    direct = os.path.join(REPORTS_BASE, patient.report_path.replace('/', os.sep))
    if os.path.exists(direct):
        found_count += 1
        continue

    # Strategy 2: Filename-only check (fallback)
    filename = patient.report_path.split('/')[-1]
    if filename in all_disk_filenames:
        found_count += 1
        continue

    missing_ids.append(patient.id)

print(f"[RESULT] Files found on disk:   {found_count}")
print(f"[RESULT] Files MISSING on disk: {len(missing_ids)}")
print()

if not missing_ids:
    print("[DONE] All report_path entries have a matching file on disk!")
    sys.exit(0)

confirm = input(f"Set report_path=NULL for {len(missing_ids)} patients with missing files? (yes/no): ").strip().lower()

if confirm == 'yes':
    updated = Patient.objects.filter(id__in=missing_ids).update(report_path=None)
    print(f"\n[DONE] Cleared report_path for {updated} patients.")
else:
    print("\n[CANCELLED] No changes made.")
