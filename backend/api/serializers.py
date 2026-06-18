from rest_framework import serializers
from .models import Usuario, Prospecto
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

class UsuarioSerializer(serializers.ModelSerializer):
    """Serializer for the custom user model."""
    class Meta:
        model = Usuario
        fields = ('id', 'email', 'username', 'first_name', 'last_name')
        read_only_fields = ('id',)

class ProspectoSerializer(serializers.ModelSerializer):
    """Serializer for Prospecto model (future use)."""
    class Meta:
        model = Prospecto
        fields = '__all__'

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
