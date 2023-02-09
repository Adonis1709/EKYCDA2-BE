const VerifyAccountProcessController = ($scope, $location, $element, $timeout, Api, ...arr) => {
    $scope.init = function () {
        $timeout(() => {
            Api.user = {
                ...Api.user,
                status: STATUS_ACCOUNT.verify_face
            }
            $location.path("/verify-account/lisence")
            $scope.$apply()
        }, 2000)
    }
    $scope.init();
}   