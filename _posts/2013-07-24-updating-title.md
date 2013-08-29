---
layout: post
title: Обновляемый title при ajax-переходах
tags: [angular]
---
При использовании AJAX при навигации по сайту обычно обновляют только контентный блок, а все остальное остается. Это как раз и дает повышение скорости работы. Однако при этом не меняется заголовок в теге `<title>`, хотя он у каждой страницы по идее свой. Сервисы, использующие AJAX, решают эту проблему разными путями. ВКонтакте, например для этой цели обновляет свойство `document.title`, с помощью скриптового блока в контенте. Но в Angular шаблоны страниц статичные, а данные получаются отдельно в виде JSON, и этот способ уже не сработает. Хороший пример обновляемого title с помощью Angular - это [их документация](http://docs.angularjs.org/api). Документация собирается в статичные страница, заголовки страниц сохраняются в JSON, а затем при загрузке текущий заголовок подставляется в `$scope`, [в исходниках](https://github.com/angular/angular.js/blob/v1.2.0rc1/docs/src/templates/js/docs.js#L641) можно посмотреть как это происходит.

Такой способ не всегда удобен, потому что в нем используется отдельный заголовок для каждой страницы, который нужно где-то брать. Иногда нужно сформировать интерактивный заголовок формата "Показано 10 записей из 150" или что-нибудь подобное. И для выполнения таких задач пригодится сервис `pageTitle`:

{% highlight javascript %}
angular.module('pageTitle').provider('pageTitle', function pageTitleProvider() {
	"use strict";
	//Стандартный заголовок, будет показываться, если другого не задано.
	//Значение можно переопределить через module.config
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

Теперь можно задать шаблон заголовка для каждой страницы, используя `$routeProvider`. В текст можно подставлять значения, используя фигурные скобки `{% raw %}{{}}{% endraw %}`, и эта информация будет обновляться &mdash; используем силу Angular:
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
		pageTitle: 'Cтатьи - страница {% raw %}{{pageNum}}{% endraw %}'	
	})
	.otherwise({
		templateUrl: '404.html',
		pageTitle: 'Страница не найдена'
	})
{% endhighlight %}

Также нужно не забыть добавить модуль `pageTitle` в зависимости основного модуля, чтобы он подключился и заработал. А если вам нужно изменять заголовок страницы без смены контента, то можно написать соответсвтвующий шаблон, и обновлять значение переменных, привязанных к нему.

И наконец, стоит заметить что боты поисковиков не исполняют скрипты, поэтому эти заголовки не будут индексироваться поисковиками. Зато заголовки увидят пользователи и удобство использования вашего Angular-приложения возрастет.