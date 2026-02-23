from django.core.management.base import BaseCommand
from api.models import Patient
from django.db.models import Count

class Command(BaseCommand):
    help = 'Check report coverage by date'

    def handle(self, *args, **options):
        self.stdout.write("--- REPORT COVERAGE BY DATE ---")
        
        # Count records that have a valid report_path
        data = Patient.objects.filter(report_path__isnull=False).exclude(report_path='').values('exam_date').annotate(count=Count('id')).order_by('exam_date')
        
        if not data:
            self.stdout.write("No reports found in database.")
            return

        for entry in data:
            self.stdout.write(f"{entry['exam_date']}: {entry['count']} reports")
            
        total = Patient.objects.filter(report_path__isnull=False).exclude(report_path='').count()
        self.stdout.write(f"--- TOTAL: {total} Records with Files ---")
