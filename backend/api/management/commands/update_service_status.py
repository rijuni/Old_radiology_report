from django.core.management.base import BaseCommand
from api.models import Patient
from django.db.models import Count

class Command(BaseCommand):
    help = 'Update service_status from 0/1/2 to New/Draft/Final'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Checking service_status distribution...'))
        
        # Show Current Counts
        counts = Patient.objects.values('service_status').annotate(total=Count('service_status'))
        for c in counts:
            self.stdout.write(f"Status '{c['service_status']}': {c['total']}")
            
        mapping = {
            "0": "New",
            "1": "Draft",
            "2": "Final"
        }
        
        total_updated = 0
        
        for old_val, new_val in mapping.items():
            updated = Patient.objects.filter(service_status=old_val).update(service_status=new_val)
            if updated > 0:
                self.stdout.write(self.style.SUCCESS(f"Updated {updated} records from '{old_val}' to '{new_val}'"))
                total_updated += updated
            else:
                self.stdout.write(f"No records found for '{old_val}'")
                
        self.stdout.write(self.style.SUCCESS(f"Finished! Total updated: {total_updated}"))
        
        # Show New Counts
        new_counts = Patient.objects.values('service_status').annotate(total=Count('service_status'))
        for c in new_counts:
            self.stdout.write(f"New Status '{c['service_status']}': {c['total']}")
