from django.core.management.base import BaseCommand
from api.models import Patient
import os
from pathlib import Path
from django.conf import settings

class Command(BaseCommand):
    help = 'Sync report_path in database with actual files in media folder'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting report path synchronization...'))
        
        # Get the media root path
        media_root = settings.MEDIA_ROOT
        kimstelerad_path = os.path.join(media_root, 'KIMSTELERAD')
        
        if not os.path.exists(kimstelerad_path):
            self.stdout.write(self.style.ERROR(f'KIMSTELERAD folder not found at: {kimstelerad_path}'))
            return
        
        # Build a dictionary of all files
        # Key: filename, Value: relative path from media root
        file_map = {}
        
        self.stdout.write('Scanning files in media folder...')
        for root, dirs, files in os.walk(kimstelerad_path):
            for file in files:
                if file.endswith(('.doc', '.docx', '.pdf')):
                    full_path = os.path.join(root, file)
                    # Get relative path from media root
                    relative_path = os.path.relpath(full_path, media_root)
                    # Convert backslashes to forward slashes for consistency
                    relative_path = relative_path.replace('\\', '/')
                    
                    # Use filename as key for matching
                    file_map[file] = relative_path
        
        self.stdout.write(f'Found {len(file_map)} files in media folder')
        
        # Now update database records
        updated_count = 0
        not_found_count = 0
        
        # Get all patients with report_path
        patients = Patient.objects.filter(report_path__isnull=False).exclude(report_path='')
        total_patients = patients.count()
        
        self.stdout.write(f'Processing {total_patients} patient records...')
        
        for i, patient in enumerate(patients):
            if i % 1000 == 0:
                self.stdout.write(f'Processed {i}/{total_patients}...')
            
            # Extract filename from current report_path
            if patient.report_path:
                current_filename = os.path.basename(patient.report_path)
                
                # Check if we have this file in our media folder
                if current_filename in file_map:
                    new_path = file_map[current_filename]
                    
                    # Only update if path is different
                    if patient.report_path != new_path:
                        patient.report_path = new_path
                        patient.save(update_fields=['report_path'])
                        updated_count += 1
                else:
                    not_found_count += 1
        
        self.stdout.write(self.style.SUCCESS(
            f'\nSynchronization complete!\n'
            f'Updated: {updated_count}\n'
            f'Files not found: {not_found_count}\n'
            f'Total processed: {total_patients}'
        ))
