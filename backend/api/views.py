from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.pagination import PageNumberPagination
from .models import User, Patient
from .serializers import UserSerializer, PatientSerializer, RegisterSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from datetime import datetime
import os
import sys
import subprocess
from django.http import FileResponse, Http404
from django.conf import settings

class PatientPagination(PageNumberPagination):
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 1000

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all().order_by('-exam_date')
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = PatientPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = {
        'modality': ['exact'],
        'service_status': ['exact'],
        'patient_type': ['exact'],
        'radiologist': ['exact'],
        'report_path': ['exact']
    }
    search_fields = ['name', 'mrn', 'accession_no']

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Custom filtering for name, id(mrn), accessionNo
        name = self.request.query_params.get('name')
        mrn = self.request.query_params.get('id') # Frontend sends 'id' for MRN
        accession_no = self.request.query_params.get('accessionNo')
        from_date = self.request.query_params.get('fromDate')
        to_date = self.request.query_params.get('toDate')

        if name:
            queryset = queryset.filter(name__icontains=name)
        if mrn:
            queryset = queryset.filter(mrn__icontains=mrn)
        if accession_no:
            queryset = queryset.filter(accession_no__icontains=accession_no)
        
        if from_date:
            queryset = queryset.filter(exam_date__gte=from_date)
        if to_date:
            queryset = queryset.filter(exam_date__lte=to_date)

        return queryset

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name
        })

class SeedDataView(APIView):
    permission_classes = [permissions.AllowAny] # Or IsAuthenticated

    def post(self, request):
        mock_patients = [
            {
                "name": "Ramesh Kumar", "mrn": "MRN123", "accession_no": "ACC001", 
                "modality": "CT", "exam_date": "2024-01-12", 
                "service_status": "Final", "patient_type": "OP", "radiologist": "Dr. Smith",
                "study_description": "CT Brain"
            },
            {
                "name": "Sita Devi", "mrn": "MRN124", "accession_no": "ACC002", 
                "modality": "US", "exam_date": "2024-01-13", 
                "service_status": "Draft", "patient_type": "IP", "radiologist": "Dr. Doe",
                "study_description": "US Abdomen"
            },
            {
                "name": "John Doe", "mrn": "MRN125", "accession_no": "ACC003", 
                "modality": "MRI", "exam_date": "2024-01-14", 
                "service_status": "New", "patient_type": "OP", "radiologist": "Dr. Smith",
                "study_description": "MRI Knee"
            },
        ]
        
        existing_mrns = Patient.objects.values_list('mrn', flat=True)
        created_count = 0
        
        for data in mock_patients:
            if data['mrn'] not in existing_mrns:
                Patient.objects.create(**data)
                created_count += 1
                
        return Response({"message": f"Seeded {created_count} patients", "total": Patient.objects.count()})

class ServeReportView(APIView):
    permission_classes = [permissions.AllowAny] # Using AllowAny to simplify access for file serving

    def get(self, request, path):
        # Construct full path
        media_root = settings.MEDIA_ROOT
        file_path = os.path.join(media_root, path)
        
        if not os.path.exists(file_path):
            raise Http404("Report not found")
            
        # If it's already a PDF, serve it inline (to open in browser)
        if file_path.lower().endswith('.pdf'):
            return FileResponse(open(file_path, 'rb'), content_type='application/pdf')
            
        # If it's a DOC/DOCX, try to find or create a PDF version
        if file_path.lower().endswith(('.doc', '.docx')):
            pdf_path = os.path.splitext(file_path)[0] + ".pdf"
            
            # Check for existing up-to-date PDF
            needs_conversion = True
            if os.path.exists(pdf_path):
                source_mtime = os.path.getmtime(file_path)
                pdf_mtime = os.path.getmtime(pdf_path)
                if pdf_mtime > source_mtime:
                    needs_conversion = False
            
            if needs_conversion:
                try:
                    # Lookup patient info for replacement
                    exam_date_str = ""
                    radiologist_name = ""
                    
                    # Normalize path for DB lookup (always use forward slashes in DB)
                    norm_path = path.replace('\\', '/')
                    patient = Patient.objects.filter(report_path=norm_path).first()
                    
                    if patient:
                        if patient.exam_date:
                            exam_date_str = patient.exam_date.strftime("%d-%m-%Y")
                        if patient.radiologist:
                            radiologist_name = patient.radiologist
                    
                    # Use PowerShell instead of Python COM to bypass common threading issues
                    script_path = os.path.join(settings.BASE_DIR, 'convert.ps1')
                    
                    print(f"Converting using PowerShell: {file_path}")
                    print(f"Replacing placeholders with: Date={exam_date_str}, Signed={radiologist_name}")
                    
                    # Construct command with arguments for replacement
                    cmd = [
                        "powershell", 
                        "-NoProfile", 
                        "-ExecutionPolicy", "Bypass", 
                        "-File", script_path, 
                        file_path, 
                        pdf_path,
                        exam_date_str, 
                        radiologist_name
                    ]
                    
                    result = subprocess.run(cmd, check=True, capture_output=True, text=True)
                    
                    # Log success for debugging
                    print(f"PowerShell Output: {result.stdout}")
                    
                except subprocess.CalledProcessError as e:
                    print(f"PS Conversion Error: {e.stderr}")
                    # Only fallback if absolutely necessary
                    return FileResponse(open(file_path, 'rb'), as_attachment=True)
                except Exception as e:
                    print(f"Unexpected Error: {e}")
                    return FileResponse(open(file_path, 'rb'), as_attachment=True)
            
            # Serve the PDF
            if os.path.exists(pdf_path):
                return FileResponse(open(pdf_path, 'rb'), content_type='application/pdf')
        
        # Default fallback
        return FileResponse(open(file_path, 'rb'), as_attachment=True)
