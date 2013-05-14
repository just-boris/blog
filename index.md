---
layout: default
title: Home
---

I currently work at [Kliniki-online.ru](http://kliniki-online.ru).

I'm also working on [my degree work](https://github.com/just-boris/application-magic) and contributing to [Anguler-UI](http://angular-ui.github.io/) projects.

## Blog

{% for post in site.posts limit:3 %}
- [{{ post.title }}]({{ post.url }})
{% endfor %}
