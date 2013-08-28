---
layout: post
title: Обновляемый title при ajax-переходах
tags: [angular]
---
При использовании AJAX при навигации по сайту обычно обновляют только контентный блок, а все остальное остается. Это и дает как раз повышение скорости работы. Однако при этом неизменным остается заголовок в теге `<title>`, хотя он по идее у каждой страницы свой. Разные сервисы решают эту задачу по-своему. ВКонтакте, например для этой цели обновляет свойство `document.title`, присылая его содержимое вместе с новым контентом. Но в Angualr шаблоны страниц статичные, а данные получаются отдельно в виде JSON. Хороший пример обновляемого title с помощью Angular - это [их документация](http://docs.angularjs.org/api). В этом случае генератор документации собирает в JSON информацию о title страниц, а затем при загрузке подставляется текущий заголовок в `$scope`, [в исходниках](https://github.com/angular/angular.js/blob/v1.2.0rc1/docs/src/templates/js/docs.js#L641) можно посмотреть как это происходит.

Такой способ не всегда удобен, потому что в нем используется отдельный заголовок для каждой страницы, который нужно создавать. Иногда нужно создать интерактивный заголовок вроде "Показано 10 записей из 150" или какой-нибудь другой шаблонный текст. И для выполнения таких задач пригодится сервис `pageTitle`:

{% highlight javascript %}
angular.module('pageTitle').provider('pageTitle', function pageTitleProvider() {
	"use strict";
	//Стандартный заголовок, будет показываться, если другого не задано.
	//Значение можно переопределить на этапе config
	this.defaultPageTitle = '';
    this.$get = [
        '$rootScope', '$compile', '$document', function ($rootScope, $compile, $document) {
            var self = this,
                titleElement = $document.find('title') || angular.element('<title>').appendTo($document.find('head'));
            return {
            	//сервис состоит из одного метода - обновить заголовок и привязать к scope нового контроллера
                update: function(template, scope) {
                    titleElement.html(template || self.defaultPageTitle);
                    $compile(titleElement)(scope);
                }
            };
        }
    ];
}).run(['pageTitle', '$rootScope', '$route', function(pageTitle, $rootScope, $route){
    "use strict";
    $rootScope.$on('$viewContentLoaded', function($event){
    	//при каждой перезагрузке контента страницы обновляем title
        pageTitle.update($route.current.pageTitle, $event.targetScope);
    });
}]);
{% endhighlight %}

Теперь можно задать шаблон заголовка для каждой страницы, используя `$routeProvider`:
{% highlight javascript %}
	$routeProvider.when('/', {
		templateUrl: 'articles.html',
		pageTitle: 'Новые статьи'
	})
	.when('/:page', {
		templateUrl: 'articles.html',
		controller: function($scope, $routeParams) {
			$scope.pageNum = $routeParams.page
		},
		pageTitle: 'Cтатьи - страница {{pageNum}}'	
	})
	.otherwise({
		templateUrl: '404.html',
		pageTitle: 'Страница не найдена'
	})
{% endhighlight %}

Также нужно не забыть добавить модуль `pageTitle` в зависимости основного модуля, чтобы он подключился и заработал.

А еще стоит заметить что эти заголовки не будут индексироваться поисковиками, поскольку роботы не исполняют javascript. Зато заголовки увидят пользователи и удобство использования вашего Angular-приложения возрастет.