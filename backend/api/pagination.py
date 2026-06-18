from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class CustomPageNumberPagination(PageNumberPagination):
    """Pagination that returns `page`, `page_size` and `count` instead of `next`/`previous` links.

    Clients can request a custom page size via the ``page_size`` query parameter (capped by ``max_page_size``).
    """

    # Allow the client to control the page size up to a reasonable maximum.
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'page': self.page.number,
            'page_size': self.get_page_size(self.request),
            'results': data,
        })
