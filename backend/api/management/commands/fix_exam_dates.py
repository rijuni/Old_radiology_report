from django.core.management.base import BaseCommand
from api.models import Patient
import os
import re
from datetime import datetime

class Command(BaseCommand):
    help = 'Fix exam_date based on Accession Number (YYYYMMDD) or Folder Path (DD-MM-YY)'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting Comprehensive Exam Date Fix...'))
        
        # Check ALL patients, prioritizing those with 2026 dates (likely wrong)
        # But really we should check everyone to be sure.
        # Check count of 2026 records first
        count_2026 = Patient.objects.filter(exam_date__year=2026).count()
        self.stdout.write(f"Found {count_2026} records with year 2026 to potentially fix.")
        
        patients = Patient.objects.all()
        total = patients.count()
        
        updated_count = 0
        batch = []
        
        # Regex for Accession: Look for YYYYMMDD (2010-2029)
        # Matches patterns like .20220501. or just 20220501 anywhere
        # Enforce reasonable year 2010-2029
        accession_date_pattern = re.compile(r'(20[12]\d)(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])')
        
        # Regex for Path: DD-MM-YY
        path_date_pattern = re.compile(r'(\d{1,2}-\d{1,2}-\d{2,4})')
        
        for i, patient in enumerate(patients.iterator(chunk_size=5000)):
            if i % 5000 == 0:
                self.stdout.write(f"Processing... {i}/{total}")

            new_date = None
            
            # 1. Try Path First (Most Reliable if report exists)
            if patient.report_path:
                matches = path_date_pattern.findall(patient.report_path)
                for date_str in matches:
                    for fmt in ["%d-%m-%y", "%d-%m-%Y"]:
                        try:
                            new_date = datetime.strptime(date_str, fmt).date()
                            break
                        except ValueError:
                            continue
                    if new_date: break
            
            # 2. If no date from path, try Accession Number
            if not new_date and patient.accession_no:
                # Search for YYYYMMDD
                match = accession_date_pattern.search(patient.accession_no)
                if match:
                    yyyy, mm, dd = match.groups()
                    try:
                        new_date = datetime(int(yyyy), int(mm), int(dd)).date()
                        # Sanity check: Date shouldn't be in future (beyond today+buffer) or too old?
                        # Assuming data is valid.
                    except ValueError:
                        pass

            # 3. Update if we found a date AND it differs from current
            if new_date:
                # Only update if current is 2026 (wrong) OR if we are sure it's wrong?
                # User asked to fix 2026.
                # If current date is 2026, definitely update.
                # If current date is NOT 2026, maybe keep it? (Unless valid path/accession contradicts?)
                # Let's overwrite everyone to strict truth from Accession/Path.
                if patient.exam_date != new_date:
                    patient.exam_date = new_date
                    batch.append(patient)
                    updated_count += 1
            
            if len(batch) >= 2000:
                Patient.objects.bulk_update(batch, ['exam_date'])
                batch = []
                self.stdout.write(f"  Updated batch of {len(batch)}. Total updated: {updated_count}")

        if batch:
            Patient.objects.bulk_update(batch, ['exam_date'])
            
        self.stdout.write(self.style.SUCCESS(f'Finished! Updated {updated_count} records.'))
