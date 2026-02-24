from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.pagination import PageNumberPagination
from .models import User, Patient
from .serializers import UserSerializer, PatientSerializer, AdminUserCreateSerializer, PasswordResetSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from datetime import datetime

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

from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return AdminUserCreateSerializer
        elif self.action == 'set_password':
            return PasswordResetSerializer
        return UserSerializer

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsAdminUser])
    def set_password(self, request, pk=None):
        user = self.get_object()
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user.set_password(serializer.validated_data['password'])
            user.save()
            return Response({'status': 'password set'})
        else:
            return Response(serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST)

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
            'last_name': user.last_name,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser
        })


