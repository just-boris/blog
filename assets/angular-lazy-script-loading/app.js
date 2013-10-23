angular.module('blurDemo', ['script'])
	.directive('blurred', ['$script', function($script) {
		return function(scope, element, attrs) {
			//дождемся загрузки плагина и активируем его
			var onPluginReady = function() {
				//вызовем конструктор
				var vague = element.Vague({
					//TODO можно забирать значение свойства из 
					//другого атрибута, будет удобно
		        	intensity : 30
		    	});
		    	//а теперь свяжемся с атрибут
				attrs.$observe('blurred', function(blurred) {
					vague[blurred === 'true' ? 'blur' : 'unblur']();
				});
				scope.$on('$destroy', function() {
					vague.destroy();
				});
			}
			$script.get('http://gianlucaguarini.github.io/Vague.js/Vague.js').then(onPluginReady);
		}
	}]);