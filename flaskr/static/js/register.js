const RegisterController = ($scope, $location, Api, ...arr) => {
    $scope.waitingApi = false;
    $scope.firstname = undefined;
    $scope.lastname = undefined;
    $scope.email = undefined;
    $scope.password = undefined;
    $scope.username = undefined;
    $scope.confirmpassword = undefined;

    $scope.usernameExit = false;
    $scope.emailExit = false;
    $scope.passwordRuleFail = false;
    $scope.emailRuleFail = false;

    $scope.handleChangePassword = (e) => {
        $scope.passwordRuleFail = !checkPasswordRule($scope.password || "")
    }
    $scope.handleChangeEmail = (e) => {
        $scope.emailRuleFail = !validateEmail($scope.email)
    }
    $scope.onSubmit = async (value) => {
        $scope.firstname = $scope.firstname || "";
        $scope.lastname = $scope.lastname || "";
        $scope.username = $scope.username || "";
        $scope.password = $scope.password || "";
        $scope.email = $scope.email || "";
        $scope.confirmpassword = $scope.confirmpassword || "";
        $scope.passwordRuleFail = !checkPasswordRule($scope.password)
        $scope.emailRuleFail = !validateEmail($scope.email)
        if (!$scope.firstname || !$scope.lastname || !$scope.email || !$scope.username || !$scope.password || !($scope.confirmpassword == $scope.password) ||
            $scope.passwordRuleFail || $scope.emailRuleFail) {
            return;
        }
        const user = {
            firstname: $scope.firstname,
            lastname: $scope.lastname,
            username: $scope.username,
            password: $scope.password,
            email: $scope.email,
            status: STATUS_ACCOUNT.verify_email,
            isLogin: true,
        }
        $scope.waitingApi = true;
        await Api.register(user)
            .then(res => {
                const { data } = res.data;
                if (!!res?.data?.code && !!data.user) {
                    const { user } = data;
                    Api.user = {
                        ...user
                    };
                    $location.path("/verify-email");
                    $scope.$apply()
                } else {
                    $scope.usernameExit = true;
                    $scope.$apply()
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
    $scope.handleUsernameChange = (e) => {
        $scope.usernameExit = false;
    }
}