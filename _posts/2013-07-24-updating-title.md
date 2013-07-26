---
layout: post
title: Обновляемый title при ajax-переходах
tags: [angular]
---
При использовании ajax при навигации по сайту обычно обновляют только контентный блок, оставляя остальныек неизменными. Это и дает как раз повышение скорости работы. Однако при этом остается неизменным заголовок страницы, хотя он по идее у каждой свой. При построении многостраничного сайта на angular как раз и возникла эта проблема. Для ее решения было решено написать свой сервис, который обновляет title при переходах. Для хранения title удобно использовать routes, потому от них также зависит и используемый шаблон на странице. Кроме того хочется связи с данными, то есть чтобы можно было в title прописать шаблон, а в него потом подставились необходимые данные из scope. В результате получился следующий сервис: