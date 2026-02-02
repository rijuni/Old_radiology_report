from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from .models import User, Patient
from .serializers import UserSerializer, PatientSerializer, RegisterSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from datetime import datetime

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = {
        'modality': ['exact'],
        'service_status': ['exact'],
        'patient_type': ['exact'],
        'radiologist': ['exact'],
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
        
        count = 0
        for p_data in mock_patients:
            if not Patient.objects.filter(mrn=p_data['mrn']).exists():
                Patient.objects.create(**p_data)
                count += 1
        
        return Response({"message": f"{count} Mock patients added"}, status=status.HTTP_201_CREATED)
