const ResetPasswordController = ($scope, $location, Api, $element) => {
    $scope.waitingApi = false

    $scope.step = 1;

    $scope.username = undefined;
    $scope.usernameError = {
        empty: false,
        incorrect: false
    }

    $scope.email = undefined;
    $scope.emailError = {
        empty: false,
        incorrect: false,
    }

    $scope.otp = undefined;
    $scope.otpError = {
        empty: false,
        incorrect: false,
    }

    $scope.password = undefined;
    $scope.passwordError = {
        empty: false,
        incorrect: false,
    }

    $scope.confirmPassword = undefined;
    $scope.confirmPasswordError = {
        empty: false,
        incorrect: false,
    }


    $scope.handleClearInput = (name) => {
        $scope[name] = "";
    }
    $scope.handleInputChange = (key) => {
        $scope[key + 'Error'] = {
            empty: false,
            incorrect: false,
        };
    }

    const handleStep1 = () => {
        $scope.usernameError = {
            empty: !$scope.username,
            incorrect: false
        }
        $scope.emailError = {
            empty: !$scope.email,
            incorrect: !!$scope.email && !validateEmail($scope.email)
        }

        const canNext = !$scope.usernameError.empty && !$scope.usernameError.incorrect
            && !$scope.emailError.empty && !$scope.emailError.incorrect;
        if (!canNext) { return }
        $scope.waitingApi = true;
        Api.resetPassword($scope.username, $scope.email)
            .then(res => {
                if (res?.data?.code == 1) {
                    $scope.step += 1
                    $scope.$apply()
                } else if (res?.data?.code == 0) {
                    //username not match
                    $scope.usernameError.incorrect = true
                    $scope.$apply()
                } else if (res?.data?.code == -1) {
                    $scope.emailError.incorrect = true
                    $scope.$apply()
                    //email not match
                } else {
                    console.log(res);
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
    const handleStep2 = () => {
        $scope.otpError = {
            empty: !$scope.otp,
            incorrect: false
        }
        const canNext = !$scope.otpError.empty && !$scope.otpError.incorrect
        if (!canNext) { return }
        $scope.waitingApi = true;
        Api.resetPassword($scope.username, $scope.email, $scope.otp)
            .then(res => {
                if (res?.data?.code == 1) {
                    $scope.step += 1
                } else if (res?.data?.code == -1) {
                    $scope.otpError.incorrect = true
                    $scope.$apply()
                } else {
                    console.log(res);
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
    const handleStep3 = () => {
        $scope.passwordError = {
            empty: !$scope.password,
            incorrect: false
        }
        $scope.confirmPasswordError = {
            empty: !$scope.confirmPassword,
            incorrect: !!$scope.confirmPassword && $scope.confirmPassword != $scope.password
        }

        const cannext = !$scope.passwordError.empty && !$scope.passwordError.incorrect
            && !$scope.confirmPasswordError.empty && !$scope.confirmPasswordError.incorrect;

        if (!cannext) { return }

        $scope.waitingApi = true;
        Api.resetPassword($scope.username, $scope.email, $scope.otp, $scope.password)
            .then(res => {
                if (res?.data?.code == 1) {
                    $scope.step == 1
                    $location.path('/')
                    $scope.$apply()
                } else {
                    console.log(res);
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
    $scope.handleNext = (e) => {
        if ($scope.step === 1) {
            handleStep1()
        } else if ($scope.step === 2) {
            handleStep2()
        } else if ($scope.step === 3) {
            handleStep3()
        } else {
            //handle other step
        }
    }
}