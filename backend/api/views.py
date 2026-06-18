from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .serializers import UsuarioSerializer, RegisterSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    """Login endpoint – returns JWT access and refresh tokens.
    Inherits default SimpleJWT serializer (TokenObtainPairSerializer).
    """
    pass

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
