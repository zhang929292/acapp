from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Player(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    photo = models.URLField(max_length=500)
    score = models.IntegerField(default=0)
    openid = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return str(self.user) + ' - ' + str(self.score)
