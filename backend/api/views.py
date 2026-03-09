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
import os
from django.conf import settings
from django.http import FileResponse, Http404

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
        
        # Custom filtering for name, id(mrn), accessionNo, study, dates
        name = self.request.query_params.get('name')
        mrn = self.request.query_params.get('id')  # Frontend sends 'id' for MRN
        accession_no = self.request.query_params.get('accessionNo')
        study = self.request.query_params.get('study')  # Study Description
        from_date = self.request.query_params.get('fromDate')
        to_date = self.request.query_params.get('toDate')

        if name:
            queryset = queryset.filter(name__icontains=name)
        if mrn:
            queryset = queryset.filter(mrn__icontains=mrn)
        if accession_no:
            queryset = queryset.filter(accession_no__icontains=accession_no)
        if study:
            queryset = queryset.filter(study_description__icontains=study)
        
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

class ServeReportView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        path_query = request.query_params.get('path')
        token_key = request.query_params.get('token')

        # Authenticate via token in query param (needed because <a href> can't send headers)
        user = request.user
        if not user.is_authenticated and token_key:
            try:
                token = Token.objects.get(key=token_key)
                user = token.user
            except Token.DoesNotExist:
                pass

        if not user.is_authenticated:
            return Response({"error": "Unauthorized. Invalid or missing token."}, status=status.HTTP_401_UNAUTHORIZED)

        if not path_query:
            return Response({"error": "No path provided"}, status=status.HTTP_400_BAD_REQUEST)

        # New structure: media/Reports/KIMSTELERAD/<DD-MM-YYYY>/<uid>/reports/<file>
        # DB stores:                 KIMSTELERAD/<DD-MM-YYYY>/<uid>/reports/<file>
        # So just join: MEDIA_ROOT/Reports/ + path_query
        reports_base = os.path.join(settings.MEDIA_ROOT, 'Reports')
        direct_path = os.path.join(reports_base, path_query.replace('/', os.sep))

        found_path = None

        # Strategy 1: Direct path match (fast — O(1))
        if os.path.exists(direct_path):
            found_path = direct_path
        else:
            # Strategy 2: Fallback — search by filename using os.walk
            file_name = path_query.split('/')[-1]
            for root_dir, dirs, files in os.walk(reports_base):
                if file_name in files:
                    found_path = os.path.join(root_dir, file_name)
                    break

        if found_path and os.path.exists(found_path):
            try:
                file_name = os.path.basename(found_path)
                file_handle = open(found_path, 'rb')
                response = FileResponse(file_handle, as_attachment=False)
                response['Content-Disposition'] = f'inline; filename="{file_name}"'
                return response
            except Exception as e:
                return Response({"error": f"Error opening file: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        raise Http404("Report not found on server")
