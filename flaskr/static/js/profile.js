const ProfileController = ($scope, $location, Api, $element) => {
    $scope.user = Api.user
    if (!$scope.user.avatarSrc.includes('static/images/avatars/')) {
        $scope.user.avatarSrc = 'static/images/avatars/' + Api.user.avatarSrc
    }

    $scope.waitingApi = false;
    $scope.emailError = {
        empty: false,
        incorrect: false,
    }
    $scope.file = undefined;
    $scope.handleClictEditAvatar = (e) => {
        $scope.imputImage = $element[0].querySelector(".imputImage");
        $scope.imputImage.click();
    }
    $scope.handleAvatarInput = (tag) => {
        $scope.file = tag.files?.[0];
        const src = (window.URL || window.webkitURL).createObjectURL($scope.file);
        $scope.user.avatarSrc = src;
        $scope.$apply()
    }
    $scope.handleRefreshUser = () => {
        $scope.waitingApi = true;
        Api.getUserById(Api.user.id)
            .then(res => {
                const { data } = res.data;
                if (res.data.code === 1) {
                    const { user } = data
                    Api.user = {
                        ...Api.user,
                        ...user
                    }
                    $scope.user = Api.user
                    $scope.user.avatarSrc = 'static/images/avatars/' + $scope.user.avatarSrc
                    $('.toast-refresh-success').toast('show')
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
    $scope.handleOnChangeUser = (key) => {
        $scope[key + 'Error'] = {
            empty: false,
            incorrect: false
        }
    }
    $scope.handleUpdateUser = () => {
        $scope.emailError = {
            empty: !$scope.user.email,
            incorrect: !!$scope.user.email && !validateEmail($scope.user.email)
        }
        const cannext = !$scope.emailError.empty && !$scope.emailError.incorrect
        if (!cannext) { return }

        $scope.waitingApi = true;
        const formdata = new FormData();
        formdata.append("avatar", $scope.file);
        formdata.append("user", JSON.stringify({
            ...Api.user,
            ...$scope.user,
        }));
        Api.updateAccount(formdata)
            .then(res => {
                const { data } = res.data;
                if (res?.data?.code == 1) {
                    const { user } = data
                    Api.user = {
                        ...Api.user,
                        ...user,
                    }
                    $scope.user = Api.user
                    $scope.user.avatarSrc = 'static/images/avatars/' + $scope.user.avatarSrc
                    $('.toast-update-success').toast('show')
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