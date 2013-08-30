---
layout: post
title: Пишем директиву-спойлер
tags: [angular]
---
Очень часто возникает необходимость обрезать длинный текст и скрывать часть его, оставляя кнопку "показать полностью". Если сайт построен на Angular JS, то для этого нужно написать директиву. Именно они в этом фреймворке отвечают за операции с html-тегами. И конечно же, будет здорово, если такую утилитарную вещь написать один раз, а потом многократно использовать полученную директиву.

Директива будет получать на вход текст, отделять в нем первую часть по некоторому признаку, прятать остальное и открывать только после нажатия на кнопку. На входе у нее будет текст для разбора и текст для кнопок "Развернуть" и "Свернуть". Это описывается в javascript-коде:

{% highlight javascript %}
var module = angular.module('articleCut')
//переопределяемая константа, в ней хранится разделитель
module.constant('articleCutSeparator', '<br><br>');
module.directive('articleCut', ['articleCutSeparator', function(cutSeparator) {
	return {
		//директива будет искаться в названиях тегов и атрибутах
		restrict: 'EA',
		//Входные значения будут браться из этих свойств
		scope: {
			text: '=',
			expanderText: '@',
			collapserText: '@'
		},
		//содержимое элемента будет браться из отдельного шаблона
		//его можно будет подменять с помощью $templateCache
		templateUrl: 'articleCut.html',
		link: function(scope, elm, attrs) {
			//наши действия зависят от текста, подпишемся на его изменения
			scope.$watch('text', function(text) {
				var index;
				if(typeof text === "string" && 
						(index = text.indexOf(cutSeparator)) !== -1) {
					//если текст определен и в нем есть разделитель
					//то в первую половину положим текст до разделителя включительно
					//а во вторую - остальное
					scope.begining = text.substring(0, index+cutSeparator.length);
					scope.ending = text.substring(index+cutSeparator.length);
				}
				else {
					//если текст без разделителя, сохраним в первую часть его целиком
					scope.begining = text;
				}
			});
		}
	};
}]);
{% endhighlight %}

Логика разделения простая, а главное, оно будет работать и обновляться, при изменениях исходного текста. При делении на части исходный текст не затрагивается, его можно использовать на этой странице и для других целей. Кроме логики нам еще нужен шаблон. При описании директивы мы указали, что он лежит по ссылке `articleCut.html`, это значит что мы должны использовать отдельный файл шаблона, но можно пойти и другим путем. Используя сервис `[$templateCache](http://docs.angularjs.org/api/ng.$templateCache)` мы запишем содержимое шаблона через javascript. Такой подход сэкономит нам загрузку одного лишнего файла и подарит возможность изменить верстку, если понадобится, не меняя исходный код скрипта. Для этого нужно заменить в templateCache шаблон, лежащий по этому url.

{% highlight javascript %}
module.run(function($templateCache){
	$templateCache.put('articleCut.html',
		//в этот елемент выведется начало текста
 		'<div ng-bind-html-unsafe="begining"></div>'+
 		//кнопка разворачивания содержит в себе текст из атрибута директивы
 		'<div class="btn-expand" ng-show="ending && !showFull" 
 						ng-click="showFull=true">{{expanderText}}</div>'+
		//в этот элемент выведется окончание текста, изначально невидимое
 		'<div ng-hide="!showFull" ng-bind-html-unsafe="ending"></div>'+
 		//кнопка сворачивания работает симметрично разворачиванию
 		'<div class="btn-collapse" ng-show="showFull && collapserText" 
 						ng-click="showFull=false">{{collapserText}}</div>'
	);
});
{% endhighlight %}

[Демо страница]({{site.baseurl}}/assets/article-cut/)

В примере были использованы стихи русских классиков и дополнительная директива `collapse`, из библиотеки [ui-bootstrap](http://angular-ui.github.io/bootstrap/#/collapse), которая позволила плавно сворачивать и разворачивать контент. Если красота при разворачивании не нужна, то подойдет и обычный `ng-hide` входящий в комплект AngularJS.