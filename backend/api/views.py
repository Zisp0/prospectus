import io
from datetime import datetime, timezone as datetime_timezone

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from rest_framework import permissions, status, viewsets, filters, parsers
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.utils import timezone
from django.db.models import Count
from django.db.models.functions import TruncDate
from drf_spectacular.utils import extend_schema, OpenApiResponse, inline_serializer
from rest_framework import serializers as drf_serializers

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

@extend_schema(
    description="Autentica al usuario con email y contraseña. Retorna tokens JWT de acceso y refresco junto con los datos del usuario.",
    request=CustomTokenObtainPairSerializer,
    responses={
        200: inline_serializer(
            name="LoginResponse",
            fields={
                "access": drf_serializers.CharField(),
                "refresh": drf_serializers.CharField(),
                "user": inline_serializer(
                    name="LoginUserData",
                    fields={
                        "id": drf_serializers.IntegerField(),
                        "email": drf_serializers.EmailField(),
                        "name": drf_serializers.CharField(),
                    }
                ),
            }
        ),
        401: OpenApiResponse(description="Credenciales incorrectas o cuenta inactiva."),
    }
)
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]

@extend_schema(
    description="Retorna la información del usuario con sesión activa. Verifica que el token no esté en la blacklist.",
    responses={
        200: UsuarioSerializer,
        401: OpenApiResponse(description="Token no proporcionado, inválido o en blacklist."),
    }
)
class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        token_jti = request.auth.get('jti') if request.auth else None
        if token_jti and BlacklistedToken.objects.filter(token__jti=token_jti).exists():
            return Response({'detail': 'Token is blacklisted.'}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = UsuarioSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

@extend_schema(
    description="Crea un nuevo usuario con nombre, email y contraseña.",
    request=RegisterSerializer,
    responses={
        201: inline_serializer(
            name="RegisterResponse",
            fields={
                "id": drf_serializers.IntegerField(),
                "email": drf_serializers.EmailField(),
                "name": drf_serializers.CharField(),
            }
        ),
        400: OpenApiResponse(description="Datos inválidos o email ya registrado."),
    }
)
class RegisterView(APIView):
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


@extend_schema(
    description=(
        "Recibe un archivo CSV y crea prospectos en masa. "
        "Valida formato, detecta duplicados y retorna un reporte detallado del procesamiento. "
        "Acepta multipart/form-data (campo `file`), CSV crudo o bytes en el body."
    ),
    request={
        "multipart/form-data": inline_serializer(
            name="CSVUploadRequest",
            fields={"file": drf_serializers.FileField()}
        )
    },
    responses={
        200: inline_serializer(
            name="CSVUploadResponse",
            fields={
                "total_procesados": drf_serializers.IntegerField(),
                "exitosos": drf_serializers.IntegerField(),
                "rechazados": drf_serializers.IntegerField(),
                "duplicados": drf_serializers.IntegerField(),
                "detalle_exitosos": drf_serializers.ListField(),
                "detalle_rechazados": drf_serializers.ListField(),
                "detalle_duplicados": drf_serializers.ListField(),
            }
        ),
        400: OpenApiResponse(description="No se envió ningún archivo."),
        401: OpenApiResponse(description="Token no proporcionado o inválido."),
    }
)
class CSVUploadView(APIView):
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

@extend_schema(
    description=(
        "Invalida el refresh token enviado y agrega el access token actual a la blacklist. "
        "Tras este llamado ambos tokens quedan inutilizables."
    ),
    request=inline_serializer(
        name="LogoutRequest",
        fields={"refresh": drf_serializers.CharField()}
    ),
    responses={
        205: OpenApiResponse(description="Logout exitoso. Tokens invalidados."),
        400: OpenApiResponse(description="Refresh token no proporcionado o inválido."),
        401: OpenApiResponse(description="Access token no proporcionado o inválido."),
    }
)
class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'error': 'Refresh token required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            # Attempt to blacklist using built‑in method (available when token_blacklist app is installed)
            token = RefreshToken(refresh_token)
            token.blacklist()
            access_jti = request.auth.get('jti') if request.auth else None
            access_exp = request.auth.get('exp') if request.auth else None
            if access_jti and access_exp:
                outstanding_access_token, _ = OutstandingToken.objects.get_or_create(
                    jti=access_jti,
                    defaults={
                        'user': request.user,
                        'token': str(request.auth),
                        'created_at': timezone.now(),
                        'expires_at': datetime.fromtimestamp(access_exp, tz=datetime_timezone.utc),
                    },
                )
                BlacklistedToken.objects.get_or_create(token=outstanding_access_token)
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except AttributeError:
            # Fallback for older SimpleJWT versions – manually delete the token record
            try:
                OutstandingToken.objects.filter(token=refresh_token).delete()
                return Response(status=status.HTTP_205_RESET_CONTENT)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@extend_schema(
    description=(
        "Retorna métricas generales de prospectos: total registrados, "
        "cuántos ingresaron hoy, los últimos 5 creados y un conteo "
        "por día de los últimos 7 días."
    ),
    responses={
        200: inline_serializer(
            name="StatsResponse",
            fields={
                "total_prospectos": drf_serializers.IntegerField(),
                "prospectos_hoy": drf_serializers.IntegerField(),
                "ultimos_5_prospectos": inline_serializer(
                    name="UltimoProspecto",
                    many=True,
                    fields={
                        "id": drf_serializers.IntegerField(),
                        "documento": drf_serializers.CharField(),
                        "nombre": drf_serializers.CharField(),
                        "email": drf_serializers.EmailField(),
                        "creado_en": drf_serializers.DateTimeField(),
                    }
                ),
                "prospectos_por_dia": drf_serializers.DictField(
                    child=drf_serializers.IntegerField(),
                    help_text="Claves: fechas ISO (YYYY-MM-DD). Valores: cantidad de prospectos creados ese día."
                ),
            }
        ),
        401: OpenApiResponse(description="Token no proporcionado o inválido."),
    }
)
class StatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        today = timezone.now().date()
        total = Prospecto.objects.count()
        today_count = Prospecto.objects.filter(creado_en__date=today).count()

        last5_qs = Prospecto.objects.order_by('-creado_en')[:5]
        last5 = [
            {
                "id": p.id,
                "documento": p.documento,
                "nombre": p.nombre,
                "email": p.email,
                "creado_en": p.creado_en,
            }
            for p in last5_qs
        ]

        # prospects per day for last 7 days
        start_date = today - timezone.timedelta(days=6)
        per_day = (
            Prospecto.objects.filter(creado_en__date__gte=start_date)
            .annotate(day=TruncDate('creado_en'))
            .values('day')
            .annotate(count=Count('id'))
            .order_by('day')
        )
        # ensure all days present
        stats_by_day = {}
        for i in range(7):
            day = (start_date + timezone.timedelta(days=i)).isoformat()
            stats_by_day[day] = 0
        for entry in per_day:
            stats_by_day[entry['day'].isoformat()] = entry['count']

        return Response(
            {
                "total_prospectos": total,
                "prospectos_hoy": today_count,
                "ultimos_5_prospectos": last5,
                "prospectos_por_dia": stats_by_day,
            },
            status=status.HTTP_200_OK,
        )
