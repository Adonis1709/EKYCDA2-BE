const LoginController = ($scope, $location, Api, ...arr) => {
    $scope.waitingApi = false;
    $scope.username = undefined;
    $scope.password = undefined;
    $scope.loginFail = false;
    Api.user = {};

    $scope.handleClearInput = (name) => {
        $scope[name] = "";
    }
    $scope.onSubmit = async (value) => {
        $scope.username = $scope.username || "";
        $scope.password = $scope.password || "";
        if (!$scope.password || !$scope.username) { return }
        $scope.waitingApi = true;
        await Api.login($scope.username, $scope.password)
            .then(res => {
                const { user } = res.data?.data;
                if (!!user) {
                    Api.user = user;
                    $location.path("/")
                    $scope.$apply()
                } else {
                    $scope.loginFail = true;
                    $scope.$apply()
                }
            })
            .catch(err => {
                console.log(err);
            })
            .finally(() => {
                $scope.waitingApi = false;
                $scope.$apply()
            })
    }

    $scope.handleChangeIput = (e) => {
        $scope.loginFail = false;
    }
}