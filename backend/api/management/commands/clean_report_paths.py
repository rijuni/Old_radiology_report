from django.core.management.base import BaseCommand
from api.models import Patient

class Command(BaseCommand):
    help = 'Clear all report_path fields to reset the database connection to the media files.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Resetting report_path for all patients...'))
        
        updated_count = Patient.objects.exclude(report_path__isnull=True).update(report_path=None)
        
        self.stdout.write(self.style.SUCCESS(f'Successfully cleared report_path for {updated_count} records.'))
