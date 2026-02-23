from django.core.management.base import BaseCommand
import os
from django.conf import settings

class Command(BaseCommand):
    help = 'Clears cached PDF files that have a source DOC/DOCX file, forcing regeneration'

    def handle(self, *args, **options):
        media_root = settings.MEDIA_ROOT
        count = 0
        
        self.stdout.write("Scanning for stale PDFs...")
        
        for root, dirs, files in os.walk(media_root):
            for file in files:
                if file.lower().endswith('.pdf'):
                    pdf_path = os.path.join(root, file)
                    base_name = os.path.splitext(pdf_path)[0]
                    
                    # Check for potential source files
                    source_exists = False
                    if os.path.exists(base_name + '.doc'):
                        source_exists = True
                    elif os.path.exists(base_name + '.docx'):
                        source_exists = True
                        
                    if source_exists:
                        try:
                            os.remove(pdf_path)
                            count += 1
                            if count % 100 == 0:
                                self.stdout.write(f"Removed {count} PDFs...")
                        except Exception as e:
                            self.stdout.write(f"Error removing {pdf_path}: {e}")
                            
        self.stdout.write(self.style.SUCCESS(f"Cleared {count} cached PDF files. They will be regenerated on next view."))
