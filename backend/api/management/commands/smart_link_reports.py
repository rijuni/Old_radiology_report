from django.core.management.base import BaseCommand
from api.models import Patient
import os
from django.conf import settings

class Command(BaseCommand):
    help = 'Smart link reports prioritizing EXISTING PDF files (User Preference: PDF > DOC)'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting smart linking (PDF priority)...'))
        
        media_root = settings.MEDIA_ROOT
        
        # Build a map of Accession Number -> Folder Path
        accession_map = {}
        
        self.stdout.write('Scanning media directory structure...')
        count = 0
        for root, dirs, files in os.walk(media_root):
            folder_name = os.path.basename(root)
            # Accession numbers look like OID strings: 1.2.3...
            if folder_name.replace('.', '').isdigit() and len(folder_name) > 10:
                accession_map[folder_name] = root
                count += 1
                if count % 1000 == 0:
                     self.stdout.write(f'Found {count} study folders...')

        self.stdout.write(f'Total study folders found: {len(accession_map)}')
        
        # Iterate through patients
        patients = Patient.objects.all()
        total_patients = patients.count()
        updated_count = 0
        
        # Prepare batch update list
        patients_to_update = []
        
        self.stdout.write(f'Checking {total_patients} patients...')
        
        for i, patient in enumerate(patients.iterator(chunk_size=2000)):
            acc = patient.accession_no
            
            if acc in accession_map:
                study_folder = accession_map[acc]
                
                # Look for a reports folder inside
                reports_folder = os.path.join(study_folder, 'reports')
                target_folder = reports_folder if os.path.exists(reports_folder) else study_folder
                
                # Find ALL valid report files
                candidates = []
                try:
                    for file in os.listdir(target_folder):
                        lower_file = file.lower()
                        if lower_file.endswith(('.pdf', '.doc', '.docx')):
                            full_path = os.path.join(target_folder, file)
                            mtime = os.path.getmtime(full_path)
                            
                            # Assign score: PDF = 10 (Highest Priority), DOC/DOCX = 1
                            # User explicitly requested PDF priority
                            score = 10 if lower_file.endswith('.pdf') else 1
                            
                            candidates.append({
                                'path': full_path,
                                'mtime': mtime,
                                'score': score
                            })
                except OSError:
                    continue 

                # Sort by Score DESC (PDF first), then Mtime DESC (Newest)
                candidates.sort(key=lambda x: (x['score'], x['mtime']), reverse=True)
                
                if candidates:
                    # Pick the winner
                    winner = candidates[0]['path']
                    
                    # Create relative path for DB
                    relative_path = os.path.relpath(winner, media_root).replace('\\', '/')
                    
                    if patient.report_path != relative_path:
                        patient.report_path = relative_path
                        patients_to_update.append(patient)
                        updated_count += 1

            if len(patients_to_update) >= 1000:
                Patient.objects.bulk_update(patients_to_update, ['report_path'])
                patients_to_update = []
                self.stdout.write(f'Updated batch. Progress: {i}/{total_patients}')

        # Final batch
        if patients_to_update:
            Patient.objects.bulk_update(patients_to_update, ['report_path'])
            
        self.stdout.write(self.style.SUCCESS(f'Smart linking sorted! Prioritized PDFs. Updated {updated_count} records.'))
