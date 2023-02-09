const FaceidProcessController = ($scope, $location, Api, $element, ...arr) => {
    const $timeout = arr[0]
    const timeout = $timeout(() => {
        const formData = new FormData();
        formData.append("user",
            JSON.stringify(
                {
                    ...Api.user,
                    status: STATUS_ACCOUNT.done
                }
            )
        )
        Api.updateAccount(formData)
            .then(res => {
                const { data } = res.data;
                if (res?.data?.code === 1) {
                    const { user } = data
                    Api.user = {
                        ...Api.user,
                        ...user
                    }
                    $location.path("/faceid-success")
                    $scope.$apply()
                } else if (res?.data.code == -1) {
                    console.log("Not match");
                } else {
                    console.log("Error???");
                }
            })
            .catch(error => {
                console.log(error);
            })
    }, 2000)
    $scope.handleStartBackToHome = (e) => {
        $location.path("/")
        clearTimeout(timeout)
    }
}