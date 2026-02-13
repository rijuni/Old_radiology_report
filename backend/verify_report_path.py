import os
import django
import sys

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import Patient

with open('report_path_verification.txt', 'w') as f:
    try:
        total = Patient.objects.count()
        with_path = Patient.objects.filter(report_path__isnull=False).exclude(report_path="").count()
        
        f.write(f"Total Patients: {total}\n")
        f.write(f"Patients with report_path: {with_path}\n")
        
        if with_path > 0:
            sample = Patient.objects.filter(report_path__isnull=False).first()
            f.write(f"Sample Path: {sample.report_path}\n")
        else:
            f.write("No report_path found!\n")
            
    except Exception as e:
        f.write(f"Error: {e}\n")
