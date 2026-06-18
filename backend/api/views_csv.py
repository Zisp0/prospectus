from rest_framework.views import APIView
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from .utils.csv_processor import process_csv

class CSVUploadView(APIView):
    """Upload a CSV file to bulk‑create Prospecto objects.

    Expected multipart form field: ``file`` containing the CSV.
    Returns a JSON dict with ``created`` count and any ``errors``.
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"error": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)
        result = process_csv(file_obj)
        return Response(result, status=status.HTTP_200_OK)
