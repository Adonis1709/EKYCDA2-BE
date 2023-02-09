const FaceidSuccessController = ($scope, $location, Api, ...arr) => {
    $scope.handleStartBackToHome = (e) => {
        $location.path("/")
    }
}