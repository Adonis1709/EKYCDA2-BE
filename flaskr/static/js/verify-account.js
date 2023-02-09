const VerifyAccountController = ($scope, $location, Api, ...arr) => {

    $scope.handleVerifyByDriverLisence = (e) => {
        Api.user = {
            ...Api.user,
            status: STATUS_ACCOUNT.verify_card
        }
        $location.path("/verify-account/cmnd")
    }
    $scope.handleVerifyByPassport = (e) => {
        Api.user = {
            ...Api.user,
            status: STATUS_ACCOUNT.verify_card
        }
        $location.path("/verify-account/cmnd")
    }
    $scope.handleVerifyByCMND = (e) => {
        Api.user = {
            ...Api.user,
            status: STATUS_ACCOUNT.verify_card
        }
        $location.path("/verify-account/cmnd")
    }
    $scope.handleBack = (e) => {
        Api.user = {
            ...Api.user,
            status: STATUS_ACCOUNT.verify_card
        }
        $location.path("/verify-account/cmnd")
    }
}