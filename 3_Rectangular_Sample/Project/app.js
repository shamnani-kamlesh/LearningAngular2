angular.module('user', ['restangular', 'ngRoute']).
	config(function ($routeProvider, RestangularProvider) {
		$routeProvider.
			when('/', {
				controller: ListCtrl,
				templateUrl: 'users.list.html'
			}).
			when('/edit/:userId', {
				controller: EditCtrl,
				templateUrl: 'users.detail.html',
				resolve: {
					user: function (Restangular, $route) {
						return Restangular.one('users', $route.current.params.userId).get();
					},
					groups: function (Restangular) {
						return Restangular.all('groups').getList().$object;
					}
				}
			}).
			when('/new', {
				controller: CreateCtrl,
				templateUrl: 'users.detail.html',
				resolve: {
					groups: function (Restangular) {
						return Restangular.all('groups').getList().$object;
					}
				}
			}).
			otherwise({redirectTo: '/'});

		RestangularProvider.setBaseUrl('https://api.mongolab.com/api/1/databases/beorg-app/collections');
		RestangularProvider.setDefaultRequestParams({ apiKey: 'WB5ZDewHyirIssJSIylEHfljGaczWmYp' })
		RestangularProvider.setRestangularFields({
			id: '_id.$oid'
		});

		RestangularProvider.setRequestInterceptor(function (elem, operation, what) {

			if (operation === 'put') {
				elem._id = undefined;
				return elem;
			}
			return elem;
		})
	});


function ListCtrl($scope, Restangular) {
	$scope.users = Restangular.all("users").getList().$object;
	$scope.groups = Restangular.all("groups").getList().$object;
}


function CreateCtrl($scope, $location, Restangular, groups) {
	$scope.groups = groups;

	$scope.save = function () {
		Restangular.all('users').post($scope.user).then(function (user) {
			$location.path('/list');
		});
	}
}

function EditCtrl($scope, $location, Restangular, user, groups) {
	$scope.groups = groups;

	var original = user;
	$scope.user = Restangular.copy(original);

	$scope.isClean = function () {
		return angular.equals(original, $scope.user);
	}

	$scope.destroy = function () {
		original.remove().then(function () {
			$location.path('/list');
		});
	};

	$scope.save = function () {
		$scope.user.put().then(function () {
			$location.path('/');
		});
	};
}
