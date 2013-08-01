angular.module('script', [])
	.factory('$script', ['$q', '$rootScope', function ($q, $rootScope) {
	    "use strict";
	    //классический кроссбраузерный способ подключить внешний скрипт
	    function loadScript(path, callback) {
    		var el = document.createElement("script");
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