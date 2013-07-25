---
layout: post
title: Ленивая загрузка скриптов для Angular
tags: [angular]
---
При разработке своего проекта приходится использовать чужие компоненты. Это могут быть лайк-кнопки или другие встраиваемые виджеты, jquery-плагины, сбор стастистики и т.д. Какими бы они не были, все равно потребуется подключить какой-нибудь js-файл себе на сайт. Но сайты бывают разные, и необходимый компонент может вызываться не в каждом случае, например не хочется грузить Яндекс-карту, пока пользователь не открыл скрытый изначально контейнер с ней.
Или вот еще пример: Есть ajax-сайт, где переходы между страницами выполняются без перезагрузки всей страницы. В таком случае приходится добавлять подключаемый модуль на все страницы, а использовать только на одной, а это не совсем эффективно.

Возникает желание указать отдельной директиве, что для ее работы нужен скрипт и она должна загрузить его перед работой. Как вариант, для этого можно использовать [RequireJS](http://requirejs.org/), но для него нужно определить модуль по принципу AMD, что не всегда возможно.

В результате было решено написать свой сервис для загрузки, который будет загружать необходимый скрипт, если его еще нет в кеше и вызывать callback после успешной загрузки. Вот код скрипта
	{% highlight javascript %}
	angular.module('script', [])
	.factory('$script', ['$q', '$rootScope', function ($q, $rootScope) {
	    "use strict";
	    function loadScript(path, callback) {
    		var el = doc.createElement("script");
			el.onload = el.onreadystatechange = function () {
			  	if (el.readyState && el.readyState !== "complete" && 
			  		el.readyState !== "loaded") {
			    	return false;
			  	}
			  	el.onload = el.onreadystatechange = null;
			  	if(angular.isFunction(callback)) {
			  		callback();
		  		}
			};
			el.async = true;
			el.src = path;
			document.getElementsByTagName('body')[0].appendChild(el);
	    }
	    var loadHistory = [],
	        pendingPromises = {};
	    return {
	        get: function(url) {
	            var deferred = $q.defer();
	            if(loadHistory.indexOf(url) !== -1) {
	                deferred.resolve();
	            }
	            else if(pendingPromises[url]) {
	                return pendingPromises[url];
	            } else {
	                loadScript(url, function() {
	                	delete pendingPromises[url];
                        loadHistory.push(url);
                        $rootScope.$apply(function() {
                            deferred.resolve();
                        });
                    });
	                pendingPromises[url] = deferred.promise;
	            }
	            return deferred.promise;
	        }
	    };
	}]);
	{% endhighlight %}
При подключении этого модуля станет доступен сервис $script, с методом `get`, который принимает url скрипта и возвращает обещание, которое выполняется, когда скрипт загружен. При помощи этого сервиса можно, например лениво обернуть jquery-плагин. Попробуем написать директиву-адаптер к плагину [vague.js](http://gianlucaguarini.github.io/vague.js/), который добавляет эффект размытия элементу
	{% highlight javascript %}	
	angular.module('vague', ['script'])
	.directive('blurred', ['$script', function($script) {
		return function(scope, element, attrs) {
			var blur = function(blurred) {
				$script('http://gianlucaguarini.github.io/vague.js/Vague.js')
					.then(function() {
						var vague = element.Vague({
							//TODO grab intensity from attribute
				        	intensity:3
				    	});
						blur = function(blurred) {
							vague[blurred ? 'blur' : 'ublur']();
						};
						$scope.on('$destroy', function() {
							vague.destroy();
						});
					});
			}
			$attrs.$observe('blurred', blur)
		}
	}]);
	{% endhighlight %}
*Позже будет демо*

Таким образом можно подключать компоненты только тогда, когда они нужны. Если пользователь не зайдет на страницу с размытием -- компонент и не загрузится.