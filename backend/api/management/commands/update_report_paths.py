from django.core.management.base import BaseCommand
from django.db import connection, transaction
from api.models import Patient
import time

class Command(BaseCommand):
    help = 'Updates report_path for existing patients from unified_report_data'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting report_path update...'))
        
        start_time = time.time()
        
        with connection.cursor() as cursor:
            # Check table existence
            cursor.execute("SHOW TABLES LIKE 'unified_report_data'")
            if not cursor.fetchone():
                self.stdout.write(self.style.ERROR("Table 'unified_report_data' does not exist."))
                return

            # Count rows for progress
            cursor.execute("SELECT COUNT(*) FROM unified_report_data")
            total_rows = cursor.fetchone()[0]
            self.stdout.write(f"Source table has {total_rows} records.")

            # Process in chunks using LIMIT/OFFSET or just simple iteration if cursor allows
            # Server-side cursor would be ideal but standard cursor fetches all by default in some drivers.
            # Let's try iterating over the cursor which should handle large datasets if configured right,
            # or use standard pagination. Given local environment, let's just fetch all IDs and paths
            # IF memory permits. 700k tuples of strings is about 70-100MB. Should be fine.
            
            self.stdout.write("Fetching source data (study_iuid, report_path)...")
            cursor.execute("SELECT study_iuid, report_path FROM unified_report_data WHERE report_path IS NOT NULL AND report_path != ''")
            
            # Fetch all might be heavy, lets fetch in batches
            batch_size = 5000
            updated_count = 0
            
            while True:
                rows = cursor.fetchmany(batch_size)
                if not rows:
                    break
                
                # Create a map for this batch: {accession_no: report_path}
                update_map = {row[0]: row[1] for row in rows}
                accession_nos = list(update_map.keys())
                
                # Fetch corresponding Patients
                patients = Patient.objects.filter(accession_no__in=accession_nos)
                
                to_update = []
                for patient in patients:
                    new_path = update_map.get(patient.accession_no)
                    if new_path and patient.report_path != new_path:
                        patient.report_path = new_path[:500] # Truncate if needed
                        to_update.append(patient)
                
                if to_update:
                    Patient.objects.bulk_update(to_update, ['report_path'])
                    updated_count += len(to_update)
                
                self.stdout.write(f"Updated {updated_count} records so far...")

        duration = time.time() - start_time
        self.stdout.write(self.style.SUCCESS(f"Completed! Updated {updated_count} records in {duration:.2f}s"))
