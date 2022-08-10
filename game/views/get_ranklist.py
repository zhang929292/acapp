from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from game.models import Player


class GetRanklistView(APIView):
    permission_classes = ([IsAuthenticated])

    def get(self, request):
        me = Player.objects.get(user=request.user)
        res = {
            'me': {
                'username': me.user.username,
                'photo': me.photo,
                'score': me.score,
                'rank': Player.objects.filter(score__gt=me.score).count() + 1,
            },
            'all': [],
        }

        players = Player.objects.all().order_by('-score')[:10]
        for player in players:
            res['all'].append({
                'username': player.user.username,
                'photo': player.photo,
                'score': player.score,
                'rank': Player.objects.filter(score__gt=player.score).count() + 1,
            })
        return Response(res)
