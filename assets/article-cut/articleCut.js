angular.module('articleCut', [])
//константу можно переопределить
.constant('articleCutSeparator', '<br><br>')
.directive('articleCut', ['articleCutSeparator', function(cutSeparator) {
	return {
		restrict: 'EA',
		scope: {
			text: '=',
			expanderText: '@',
			collapserText: '@'
		},
		templateUrl: '/articleCut.html',
		link: function(scope, elm, attrs) {
			scope.$watch('text', function(text) {
				var index;
				if(typeof text === "string" && (index = text.indexOf(cutSeparator)) !== -1) {
					scope.begining = text.substring(0, index+cutSeparator.length);
					scope.ending = text.substring(index+cutSeparator.length);
				}
				else {
					scope.begining = text;
				}
			})
		}
	}
}])
.run(function($templateCache){
	$templateCache.put('/articleCut.html',
		'<div>'+
	 		'<div ng-bind-html-unsafe="begining"></div>'+
	 		'<div class="btn-expand" ng-show="ending && !showFull" ng-click="showFull=true">{{expanderText}}</div>'+
	 		'<div collapse="!showFull" ng-bind-html-unsafe="ending"></div>'+
	 		'<div class="btn-collapse" ng-show="showFull && collapserText" ng-click="showFull=false">{{collapserText}}</div>'+
 		'</div>'
	)
});