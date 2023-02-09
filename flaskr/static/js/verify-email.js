const VerifyEmailController = ($scope, $location, Api, $interval, ...arr) => {
    $scope.waitingApi = true;
    Api.sendMailVerify(Api.user)
        .then(rs => {
            console.log(rs);
        })
        .catch(err => {
            console.log(err);
        })
        .finally(() => {
            $scope.waitingApi = false;
            $scope.$apply()
        })

    $scope.idInterval = $interval(() => {
        Api.getUserVerify(Api.user)
            .then(res => {
                const { data } = res.data;
                if (res.data.code === 1) {
                    clearInterval($scope.idInterval.$$intervalId);
                    const { user } = data
                    Api.user = {
                        ...user
                    };
                    $location.path("/verify-account");
                    $scope.$apply()
                } else {
                    console.log(res);
                }
            })
            .catch(error => {
                clearInterval($scope.idInterval.$$intervalId);
                console.log(error);
            })
    }, 3000)

    $scope.handleClickReSend = (e) => {
        $scope.waitingApi = true;
        Api.sendMailVerify(Api.user)
            .then(rs => {
                console.log(rs);
            })
            .catch(error => {
                console.log(error);
            })
            .finally(() => {
                $scope.waitingApi = false;
                $scope.$apply()
            })
    }
    $scope.$on('$destroy', function () {
        clearInterval($scope.idInterval.$$intervalId);
    })
}