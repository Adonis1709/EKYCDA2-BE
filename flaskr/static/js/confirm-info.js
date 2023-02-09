const ConfirmInfoController = ($scope, $location, Api, $element, ...arr) => {
    $scope.waitingApi = false;
    $scope.user = Api.user;
    $scope.file = undefined;
    if (!$scope.user.avatarSrc) {
        $scope.user.avatarSrc = "avatar-default.png";
    }
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
    $scope.onSubmit = async (value) => {
        if (!$scope.user.idIdentityCard && !$scope.user.fullname && !$scope.user.dateOfBirth
            && !$scope.user.sex && !$scope.user.placeOfOrigin && !$scope.user.placeOfResidence
            && !$scope.user.dateOfExpiry) {
            return;
        }
        const formdata = new FormData();
        formdata.append("avatar", $scope.file);
        formdata.append("user", JSON.stringify({
            ...Api.user,
            ...$scope.user,
            status: STATUS_ACCOUNT.verify_face
        }));
        $scope.waitingApi = true;
        Api.updateAccount(formdata)
            .then(res => {
                const { data } = res.data;
                if (res?.data?.code == 1) {
                    const { user } = data
                    Api.user = {
                        ...user,
                        status: STATUS_ACCOUNT.verify_process_profile
                    }
                    $location.path("/faceid");
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