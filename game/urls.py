from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from game.views.apply_code import apply_code
from game.views.receive_code import receive_code
from game.views.update_score import UpdateScoreView
from game.views.get_ranklist import GetRanklistView


urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('apply_code/', apply_code, name="apply_code"),
    path('receive_code/', receive_code, name="receive_code"),
    path('update_score/', UpdateScoreView.as_view(), name="update_score"),
    path('get_ranklist/', GetRanklistView.as_view(), name="get_ranklist"),
]
