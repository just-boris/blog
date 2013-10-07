angular.module('recursiveDemo', []).controller('ReviewsCtrl', function($scope) {
	$scope.setParentReview = function(review) {
		$scope.parentReview = review;
	};
	$scope.addReview = function() {
		var target;
		if($scope.parentReview) {
			target = $scope.parentReview.reviews = $scope.parentReview.reviews || [];
		}
		else {
			target = $scope.reviews;
		}
		target.push({
			author: $scope.name,
			text: $scope.reviewText
		});
		$scope.reviewText = "";
	}
	$scope.reviews = [{
		"text": "Есть только одно благо — знание и только одно зло — невежество",
		"author": "Сократ",
		"reviews": [{
			"author": "Фридрих Ницше",
			"text": "Один я в белом пальто стою красивый"
		}, {
			"author": "Платон",
			"text": "Очень плох человек, ничего не знающий, да и не пытающийся что-нибудь узнать",
			"reviews": [{
				"author": "Сократ",
				"text": "Про cебя пишете?"
			}]
		}]
	}, {
		"author": "Галилей Галилео",
		"text": "Земля - не центр мира, а обращается вокруг Солнца",
		"reviews": [{
			"author": "Папа Римский Павел V",
			"text": "Сожгу на костре"
		}, {
			"author": "Симпличио",
			"text": "А какие ваши аргументы?",
			"reviews": [{
				"text": "Я видел тень на диске Венеры, откуда же ей там взяться?",
				"author": "Галилей Галилео",
				"reviews": [{
					"author": "Симпличио",
					"text": "Аргументный аргумент!"
				}]
			}]
		}]
	}]
}).config(function($locationProvider) {
	$locationProvider.html5Mode(true).hashPrefix('#');
});