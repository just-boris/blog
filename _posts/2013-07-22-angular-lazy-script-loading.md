---
layout: post
title: Ленивая загрузка скриптов для Angular
tags: [angular]
---
При разработке своего проекта приходится использовать чужие компоненты. Это могут быть лайк-кнопки или другие встраиваемые виджеты, jquery-плагины, сбор стастистики и т.д. Все это дело подключается к сайту через вставку js-файла. Но сайты бывают разные, и необходимый компонент может понадобиться не сразу, например не хочется грузить Яндекс-карту, пока пользователь не открыл скрытый изначально контейнер с ней.
Есть и другой пример: ajax-сайт, где переходы между страницами выполняются без перезагрузки всей страницы. В этом случае основная часть страницы остается неизменной, а значит если туда добавить скрипт, то он будет грузиться на всех страницах и не всегда он будет нужен, а это совсем нездорово.

Поэтому возникает желание стать властелином скриптов, чтобы они появлялись только в случае необходимости по вашему желанию. Самый простой вармант стать властелином - это [RequireJS](http://requirejs.org/), но для него нужно определить модуль по принципу AMD, а это не всегда возможно и может стать препятствием на пути скриптового властелина.

В результате, было решено написать свой сервис для загрузки, который будет загружать необходимый скрипт, если его еще нет в кеше и вызывать callback после успешной загрузки. Вот код скрипта
{% highlight javascript %}
	angular.module('script', [])
	.factory('$script', ['$q', '$rootScope', function ($q, $rootScope) {
	    "use strict";
	    //канонический кроссбраузерный способ подключить внешний скрипт
	    function loadScript(path, callback) {
    		var el = doc.createElement("script");
			el.onload = el.onreadystatechange = function () {
			  	if (el.readyState && el.readyState !== "complete" && 
			  		el.readyState !== "loaded") {
			    	return false;
			  	}
			  	// если все загрузилось, то снимаем обработчик и выбрасываем callback
			  	el.onload = el.onreadystatechange = null;
			  	if(angular.isFunction(callback)) {
			  		callback();
		  		}
			};
			el.async = true;
			el.src = path;
			document.getElementsByTagName('body')[0].appendChild(el);
	    }
	    var loadHistory = [], //кэш загруженных файлов
	        pendingPromises = {}; //обещания на текущие загруки
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
                        //обязательно использовать `$apply`, чтобы сообщить 
                        //angular о том, что что-то произошло
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
При подключении этого модуля станет доступен сервис $script, с методом `get`, который принимает url скрипта и возвращает обещание, которое выполняется при окончании загрузки скрипта. При помощи этого сервиса можно, например лениво обернуть jquery-плагин и избавиться от загрузки плагина, если он не используется. Для примера напишем директиву-адаптер к плагину [vague.js](http://gianlucaguarini.github.io/vague.js/), который размывает элементы:
{% highlight javascript %}	
	angular.module('vague', ['script'])
	.directive('blurred', ['$script', function($script) {
		return function(scope, element, attrs) {
			//будем слушать атрибут на наличие изменений
			var onBlurChange = function(blurred) {
				//загружаем нужную библиотеку
				$script('http://gianlucaguarini.github.io/vague.js/Vague.js')
					.then(function() {
						//а теперь можно ее использовать
						//вызовем конструктор
						var vague = element.Vague({
							//TODO можно забирать значение свойства из 
							//другого атрибута, будет удобно
				        	intensity:3
				    	});
				    	//после изначальной загрузки можно упростить слушатель
						onBlurChange = function(blurred) {
							vague[blurred ? 'blur' : 'ublur']();
						};
						$scope.on('$destroy', function() {
							vague.destroy();
						});
					});
			}
			$attrs.$observe('blurred', onBlurChange)
		}
	}]);
{% endhighlight %}

*Позже будет демо* 

Вот так можно подключать компоненты только тогда, когда они нужны. Если пользователь не зайдет на страницу с размытием -- компонент и не загрузится.