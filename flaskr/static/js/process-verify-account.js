const ProcessVerifyAccountController = ($scope, $location, Api, $element, ...arr) => {
    $scope.step = 1;
    $scope.cannext = false;
    $scope.waitingApi = false;
    $scope.errorCheck = false;

    $scope.imageFront = "static/images/cmnd-example.png"
    $scope.imageBack = "static/images/back-cmnd.png"

    $scope.handleFrontInput = async (tag) => {
        $scope.waitingApi = true;
        const image = tag.files?.[0]
        $scope.imageFront = (window.URL || window.webkitURL).createObjectURL(image);
        const data = new FormData()
        data.append('image', image)
        data.append('user', JSON.stringify(Api.user))
        data.append('typeImage', "cardFront")
        Api.verifyCard(data)
            .then(res => {
                if (res?.data?.code == 1) {
                    const user = res?.data?.data.user;
                    Api.user = {
                        ...Api.user,
                        ...user
                    }
                    $scope.step = 2;
                    $scope.errorCheck = false;
                } else if (res?.data?.code == -1) {
                    console.log("Handle error confirm card type error");
                    $scope.errorCheck = true;
                } else {
                    console.log("Handle error confirm card");
                    $scope.errorCheck = true;
                }
                $scope.$apply();
            })
            .catch(error => {
                console.log(error);
            })
            .finally(() => {
                $scope.waitingApi = false;
                $scope.$apply();
            })
    }
    $scope.handleBackInput = (tag) => {
        $scope.waitingApi = true;
        const image = tag.files?.[0]
        $scope.imageBack = (window.URL || window.webkitURL).createObjectURL(image);
        $scope.$apply();
        const data = new FormData()
        data.append('image', image)
        data.append('user', JSON.stringify(Api.user))
        data.append('typeImage', "cardBack")
        Api.verifyCard(data)
            .then(res => {
                if (res?.data?.code == 1) {
                    const user = res?.data?.data.user;
                    Api.user = {
                        ...Api.user,
                        ...user
                    }
                    $scope.step = 3;
                    $scope.errorCheck = false;
                } else if (res?.data?.code == -1) {
                    console.log("Handle error confirm card type error");
                    $scope.errorCheck = true;
                } else {
                    console.log("Handle error confirm card");
                    $scope.errorCheck = true;
                }
                $scope.$apply();
            })
            .catch(error => {
                console.log(error);
            })
            .finally(() => {
                $scope.waitingApi = false;
                $scope.$apply();
            })
    }
    $scope.handleFinish = (tag) => {
        // Api.user.status = STATUS_ACCOUNT.vexrify_process_card
        Api.user = {
            ...Api.user,
            status: STATUS_ACCOUNT.verify_profile,
        }
        $location.path("/confirm-info")
    }
    $scope.goFrontForward = (e) => {
        if ($scope.cannext == false) { return }
        $scope.step = 2;
    }
    $scope.goBackForward = (e) => {
        if ($scope.cannext == false) { return }
        $scope.step = 3;
    }
    $scope.handleClickBack = (e) => {
        $scope.step -= 1;
    }
}