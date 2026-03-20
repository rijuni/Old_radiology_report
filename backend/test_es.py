import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.documents import PatientDocument

s = PatientDocument.search()
qs = s.to_queryset()
print("ES count:", s.count())
print("QS count:", qs.count())
