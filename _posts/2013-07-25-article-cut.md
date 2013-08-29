---
layout: post
title: Пишем директиву-спойлер
tags: [angular]
---
Очень часто возникает необходимость обрезать длинный текст и скрывать часть его, оставляя кнопку "показать еще". Фреймворк AngularJS построен на принципах разделения ответственности. И за операции с html-тегами отвечают директивы. Конечно же, будет здоорово, если такую утилитарную вещь написать один раз, а потом многократно использовать.

Сначала продумаем интерфейс. Директива будет получать на вход текст, отделять в нем первую часть по некоторому признаку, прятать остальное и открывать только после нажатия на кнопку. Это описывается в javascript-коде:

{% highlight javascript %}
angular.module('articleCut')
//константу можно переопределить
.constant('articleCutSeparator', '<br><br>')
.directive('articleCut', ['articleCutSeparator', function(cutSeparator) {
	return {
		restrict: 'EA',
		scope: {
			text: '='
		},
		templateUrl: '/articleCut.html',
		link: function(scope, elm, attrs) {
			scope.$watch('text', function(text) {
				var index;
				if(typeof text === "string" && 
						(index = text.indexOf(cutSeparator)) !== -1) {
					scope.begining = text.substring(0, index+cutSeparator.length);
					scope.ending = text.substring(index+cutSeparator.length);
				}
				else {
					scope.begining = text;
				}
			})
		}
	}

}]);
{% endhighlight %}

[Демо-страница]({{site.baseurl}}/assets/article-cut/)