const HomeController = ($scope, $location, Api, ...arr) => {
    const token = $location.$$search.token;
    if (!!token) {
        Api.decode(token)
            .then((res) => {
                const { user } = res.data?.data;
                if (!!user) {
                    Api.user = {
                        ...Api.user,
                        ...user
                    };
                }
                $location.search('token', null)
                $location.path("/")
                $scope.$apply()
            })
            .catch((error) => {
                console.log(error);
            })
    }
}