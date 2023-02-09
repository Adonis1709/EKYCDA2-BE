const ChangePasswordController = ($scope, $location, Api, $element) => {
    $scope.waitingApi = false;
    $scope.oldPassword = ''
    $scope.oldPasswordError = {
        empty: false,
        incorrect: false
    }
    $scope.newPassword = ''
    $scope.newPasswordError = {
        empty: false,
        incorrect: false
    }
    $scope.confirmPassword = ''
    $scope.confirmPasswordError = {
        empty: false,
        incorrect: false
    }
    $scope.handleInputChange = (key) => {
        $scope[key + 'Error'] = {
            empty: false,
            incorrect: false
        }
    }
    $scope.handleUpdatePassword = () => {
        $scope.oldPasswordError = {
            empty: !$scope.oldPassword,
            incorrect: false,
        }
        $scope.newPasswordError = {
            empty: !$scope.newPassword,
            incorrect: !!$scope.newPassword && !checkPasswordRule($scope.newPassword),
        }
        $scope.confirmPasswordError = {
            empty: !$scope.confirmPassword,
            incorrect: !!$scope.confirmPassword && $scope.confirmPassword !== $scope.newPassword
        }
        const cannext = !$scope.oldPasswordError.empty && !$scope.oldPasswordError.incorrect
            && !$scope.newPasswordError.empty && !$scope.newPasswordError.incorrect
            && !$scope.confirmPasswordError.empty && !$scope.confirmPasswordError.incorrect
        if (!cannext) { return }

        $scope.waitingApi = true;
        Api.changePasswoed($scope.oldPassword, $scope.newPassword, Api.user)
            .then(res => {
                const { data } = res.data;
                if (res?.data?.code == 1) {
                    const { user } = data
                    Api.user = {
                        ...Api.user,
                        ...user,
                    }
                    $scope.user = Api.user
                    $scope.oldPassword = ''
                    $scope.newPassword = ''
                    $scope.confirmPassword = ''
                    $('.toast-change-password-success').toast('show')
                    $scope.$apply()
                } else if (res?.data?.code == -1) {
                    $('.toast-old-password-notmatch').toast('show')
                    $scope.oldPasswordError.incorrect = true
                    $scope.$apply()
                } else {
                    console.log("Error update profile");
                }
            })
            .catch(error => {
                console.log(error);
            })
            .finally(() => {
                $scope.waitingApi = false;
                $scope.$apply()
            })
    }
}