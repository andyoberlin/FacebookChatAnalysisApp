from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    url(r'^$', 'main.views.applications.Home.Application.renderAction', name='home'),
    #url(r'^/(\d+)$', '')
    # url(r'^blog/', include('blog.urls')),
)
