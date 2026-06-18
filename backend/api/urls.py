from django.urls import path
from .views import CustomTokenObtainPairView, TokenRefreshView, MeView, RegisterView

urlpatterns = [
    # Login – obtain JWT pair
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    # Refresh token
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Current user endpoint
    path('me/', MeView.as_view(), name='me'),
    # Register endpoint
    path('register/', RegisterView.as_view(), name='register'),
]
