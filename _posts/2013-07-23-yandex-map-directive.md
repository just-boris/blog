---
layout: post
title: Пишем директиву для Яндекс-карт
tags: [angular, yandex]
---

В AngularJS есть удобная вещь - директивы. С их помощью можно создавать свои html-теги и прописывать им свое поведение. Так, например можно создать тег `<yandex-map>` который будет создавать на странице карту. Самый простой реализации - вызвать [конструктор карты](http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/Map.xml) на этапе link:

	