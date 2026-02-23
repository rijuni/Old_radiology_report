from django.core.management.base import BaseCommand
from django.db import connection
from api.models import Patient
from datetime import datetime
import time

class Command(BaseCommand):
    help = 'Imports data from unified_report_data table to api_patient table'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting data import...'))
        
        with connection.cursor() as cursor:
            # Check if source table exists
            cursor.execute("SHOW TABLES LIKE 'unified_report_data'")
            if not cursor.fetchone():
                self.stdout.write(self.style.ERROR("Table 'unified_report_data' does not exist."))
                return

            self.stdout.write("Fetching data from unified_report_data...")
            cursor.execute("""
                SELECT 
                    pat_id, 
                    pat_name, 
                    study_iuid, 
                    modality, 
                    study_description, 
                    status, 
                    ref_physician, 
                    report_path,
                    study_datetime 
                FROM unified_report_data
            """)
            
            rows = cursor.fetchall()
            total_rows = len(rows)
            self.stdout.write(f"Found {total_rows} records. Processing...")
            
            patients_to_create = []
            seen_accession_nos = set()
            
            # Pre-fetch existing accession numbers to avoid duplicates
            existing_accessions = set(Patient.objects.values_list('accession_no', flat=True))
            seen_accession_nos.update(existing_accessions)
            
            start_time = time.time()
            created_count = 0
            skipped_count = 0

            for i, row in enumerate(rows):
                pat_id, pat_name, study_iuid, modality, study_desc, status, ref_phys, report_path, study_dt = row
                
                # Deduplication check
                if study_iuid in seen_accession_nos:
                    skipped_count += 1
                    continue
                
                seen_accession_nos.add(study_iuid)
                
                # Date parsing
                exam_date_val = None
                if study_dt:
                    try:
                        if isinstance(study_dt, str):
                            header = study_dt.strip()
                            if header:
                                exam_date_val = datetime.strptime(header, '%Y-%m-%d %H:%M:%S').date()
                        else:
                            exam_date_val = study_dt.date()
                    except (ValueError, AttributeError):
                        pass
                
                if not exam_date_val:
                    exam_date_val = datetime.today().date()

                # Data Cleaning
                mrn = pat_id if pat_id else "UNKNOWN"
                name = pat_name if pat_name else "Unknown"
                accession_no = study_iuid if study_iuid else f"UNK-{len(seen_accession_nos)}"
                modality = modality if modality else "OT"
                study_description = study_desc if study_desc else ""
                service_status = status if status else "0"
                radiologist = ref_phys if ref_phys else "Unknown"

                # Radiologist Name Formatting
                if radiologist and '^' in radiologist:
                    parts = radiologist.split('^')
                    try:
                        last = parts[0]
                        first = parts[1]
                        title = parts[3] if len(parts) > 3 else ""
                        radiologist = f"{title} {first} {last}".strip()
                    except IndexError:
                        pass

                patient = Patient(
                    mrn=mrn[:50],
                    name=name[:255],
                    accession_no=accession_no[:50],
                    modality=modality[:10],
                    study_description=study_description[:255],
                    service_status=service_status[:20],
                    patient_type="OP",
                    radiologist=radiologist[:255],
                    report_path=report_path[:500] if 'report_path' in locals() else None,
                    exam_date=exam_date_val
                )
                patients_to_create.append(patient)
                created_count += 1
                
                # Batch create
                if len(patients_to_create) >= 2000:
                    Patient.objects.bulk_create(patients_to_create)
                    patients_to_create = []
                    self.stdout.write(f"Processed {i+1}/{total_rows}...")

            # Create remaining
            if patients_to_create:
                Patient.objects.bulk_create(patients_to_create)
            
            end_time = time.time()
            duration = end_time - start_time
            
            self.stdout.write(self.style.SUCCESS(
                f"Completed! Created: {created_count}, Skipped (Duplicate): {skipped_count}. Duration: {duration:.2f}s"
            ))
