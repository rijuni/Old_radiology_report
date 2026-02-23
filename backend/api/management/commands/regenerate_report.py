from django.core.management.base import BaseCommand
from api.models import Patient
import os
import subprocess
from django.conf import settings

class Command(BaseCommand):
    help = 'Regenerate PDF report for a specific MRN to fix missing dates/signatures'
    
    def add_arguments(self, parser):
        parser.add_argument('mrn', type=str, help='MRN of the patient')

    def handle(self, *args, **options):
        mrn = options['mrn']
        try:
            patients = Patient.objects.filter(mrn=mrn)
            if not patients.exists():
                self.stdout.write(self.style.ERROR(f'Patient with MRN {mrn} not found'))
                return

            self.stdout.write(f"Found {patients.count()} records for MRN {mrn}")
            
            for patient in patients:
                self.stdout.write(f"Checking Accession: {patient.accession_no}")
                
                # Current report path
                current_path = patient.report_path
                if not current_path:
                    self.stdout.write(self.style.WARNING("  No report path linked. Skipping."))
                    continue
                    
                full_current_path = os.path.join(settings.MEDIA_ROOT, current_path)
                
                # Identify Source DOC/DOCX
                base_path = os.path.splitext(full_current_path)[0]
                source_file = None
                
                # If pointing to PDF, check for associated DOC
                if full_current_path.lower().endswith('.pdf'):
                    if os.path.exists(base_path + ".doc"):
                        source_file = base_path + ".doc"
                    elif os.path.exists(base_path + ".docx"):
                        source_file = base_path + ".docx"
                elif full_current_path.lower().endswith(('.doc', '.docx')):
                    source_file = full_current_path
                    
                if not source_file:
                     self.stdout.write(self.style.ERROR("  No source .doc/.docx file found to regenerate from."))
                     continue
                     
                self.stdout.write(f"  Found source file: {source_file}")
                
                # Target PDF (force overwrite)
                target_pdf = os.path.splitext(source_file)[0] + ".pdf"
                
                # Prepare arguments for replacement
                exam_date_str = patient.exam_date.strftime("%d-%m-%Y") if patient.exam_date else ""
                radiologist_name = patient.radiologist if patient.radiologist else ""
                
                self.stdout.write(f"  Regenerating PDF with Date='{exam_date_str}' and Sign='{radiologist_name}'...")
                
                script_path = os.path.join(settings.BASE_DIR, 'convert.ps1')
                
                # Run PowerShell
                cmd = [
                    "powershell", 
                    "-NoProfile", 
                    "-ExecutionPolicy", "Bypass", 
                    "-File", script_path, 
                    source_file, 
                    target_pdf,
                    exam_date_str, 
                    radiologist_name
                ]
                
                result = subprocess.run(cmd, capture_output=True, text=True)
                
                if result.returncode == 0:
                     self.stdout.write(self.style.SUCCESS(f"  Successfully regenerated PDF: {target_pdf}"))
                     # Update DB to point to PDF if it points to DOC
                     rel_path = os.path.relpath(target_pdf, settings.MEDIA_ROOT).replace('\\', '/')
                     if patient.report_path != rel_path:
                         patient.report_path = rel_path
                         patient.save()
                         self.stdout.write(self.style.SUCCESS(f"  Updated database link to new PDF."))
                else:
                     self.stdout.write(self.style.ERROR(f"  Conversion Failed: {result.stderr}"))
                     
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error: {e}"))
