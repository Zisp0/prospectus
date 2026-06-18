import re
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from .models import Usuario, Prospecto


class UsuarioSerializer(serializers.ModelSerializer):
    """Serializer for the custom user model."""
    class Meta:
        model = Usuario
        fields = ('id', 'username', 'email', 'first_name', 'last_name')
        read_only_fields = ('id',)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Overrides login serializer to include user details in the token response.
    """
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UsuarioSerializer(self.user).data
        return data


class ProspectoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prospecto
        fields = '__all__'

    def validate_email(self, value):
        pattern = r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$'
        if not re.match(pattern, value):
            raise serializers.ValidationError('Correo electrónico no válido.')
        return value

    def validate_documento(self, value):
        if not value.strip():
            raise serializers.ValidationError('El documento no puede estar vacío.')
        return value.strip()


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration (name, email, password)."""
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, style={'input_type': 'password'}, label='Confirm password')
    name = serializers.CharField(source='username', required=True)

    class Meta:
        model = Usuario
        fields = ('email', 'name', 'password', 'password2')
        extra_kwargs = {'email': {'required': True}}

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords must match."})
        # Validate password strength using Django's validators
        try:
            validate_password(attrs['password'], self.instance)
        except ValidationError as e:
            raise serializers.ValidationError({"password": e.messages})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = Usuario(**validated_data)
        user.set_password(password)
        user.save()
        return user
