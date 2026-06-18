import io
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import permissions, status, viewsets, filters, parsers
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import Prospecto
from .serializers import (
    UsuarioSerializer,
    RegisterSerializer,
    ProspectoSerializer,
    CustomTokenObtainPairSerializer,
)
from .utils.csv_processor import procesar_csv


class CSVParser(parsers.BaseParser):
    """Parse raw CSV payloads with Content-Type 'text/csv'."""
    media_type = 'text/csv'

    def parse(self, stream, media_type=None, parser_context=None):
        return stream.read()


class OctetStreamParser(parsers.BaseParser):
    """Parse raw binary uploads with Content-Type 'application/octet-stream'."""
    media_type = 'application/octet-stream'

    def parse(self, stream, media_type=None, parser_context=None):
        return stream.read()


class CustomTokenObtainPairView(TokenObtainPairView):
    """Login endpoint – returns JWT access and refresh tokens along with user data."""
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]


class MeView(APIView):
    """GET /api/me/ – returns authenticated user's data."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        serializer = UsuarioSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class RegisterView(APIView):
    """Endpoint for user registration (name, email, password)."""
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            "id": user.id,
            "email": user.email,
            "name": user.username,
        }, status=status.HTTP_201_CREATED)


class QSearchFilter(filters.SearchFilter):
    search_param = 'q'


class ProspectoViewSet(viewsets.ModelViewSet):
    """CRUD API for Prospecto with search & ordering filters."""
    queryset = Prospecto.objects.all()
    serializer_class = ProspectoSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [QSearchFilter, filters.OrderingFilter]
    search_fields = ['documento', 'nombre', 'email']
    ordering_fields = ['documento', 'nombre', 'fecha', 'creado_en']


class CSVUploadView(APIView):
    """Upload a CSV file to bulk‑create Prospecto objects."""
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, CSVParser, OctetStreamParser]

    def post(self, request, *args, **kwargs):
        # Support multipart/form-data, raw file upload, and raw CSV body
        if request.FILES:
            file_obj = request.FILES.get('file')
        elif isinstance(request.data, (bytes, bytearray)):
            # request.data contains raw bytes from CSVParser
            file_obj = io.BytesIO(request.data)
        else:
            # Fallback: treat request.body as CSV content
            file_obj = io.BytesIO(request.body)
        
        if not file_obj:
            return Response({'error': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)
        
        result = procesar_csv(file_obj)
        return Response(result, status=status.HTTP_200_OK)

# Logout endpoint
class LogoutView(APIView):
    """Invalidate a refresh token (logout)."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'error': 'Refresh token required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            # Attempt to blacklist using built‑in method (available when token_blacklist app is installed)
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except AttributeError:
            # Fallback for older SimpleJWT versions – manually delete the token record
            from rest_framework_simplejwt.token_blacklist.models import OutstandingToken
            try:
                OutstandingToken.objects.filter(token=refresh_token).delete()
                return Response(status=status.HTTP_205_RESET_CONTENT)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
