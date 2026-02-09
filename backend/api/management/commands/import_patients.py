
import csv
import datetime
from django.core.management.base import BaseCommand
from api.models import Patient
import os

class Command(BaseCommand):
    help = 'Import patients from CSV file'

    def handle(self, *args, **kwargs):
        file_path = 'data_june_to_dec_2024.csv'
        
        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f'File "{file_path}" not found.'))
            return

        with open(file_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            count = 0
            for row in reader:
                try:
                    date_str = row.get('study_datetime', '').split(' ')[0]
                    try:
                        exam_date = datetime.datetime.strptime(date_str, '%m/%d/%Y').date()
                    except ValueError:
                        exam_date = datetime.date.today()

                    status = 'New'
                    if row.get('report_path'):
                        status = 'Final'
                    
                    Patient.objects.update_or_create(
                        mrn=row['pat_id'],
                        defaults={
                            'name': row['pat_name'],
                            'accession_no': row['study_iuid'],
                            'modality': row['modality'],
                            'study_description': row['study_description'],
                            'service_status': status,
                            'patient_type': 'OP',
                            'radiologist': row.get('report_user') or row.get('ref_physician', 'Unknown'),
                            'exam_date': exam_date,
                        }
                    )
                    count += 1
                    if count % 100 == 0:
                        self.stdout.write(f'Imported {count} rows...')
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f'Skipping row due to error: {e}'))

        self.stdout.write(self.style.SUCCESS(f'Successfully imported {count} patients.'))
