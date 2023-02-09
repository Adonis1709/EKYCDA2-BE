function isNumeric(str) {
    if (typeof str == "number") return true // we only process strings!  
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}
const TransferController = ($scope, $location, Api, $element, $q, $timeout) => {

    $scope.waitingApi = false;

    $scope.amountBalance = Api.user.amountBalance;
    $scope.amountBalanceAf = Api.user.amountBalance;

    $scope.step = 1
    $scope.receiverId = undefined
    $scope.receiverIdError = {
        empty: false,
        incorrect: false
    }
    $scope.amountMoney = ""
    $scope.amountMoneyError = {
        empty: false,
        incorrect: false,
    }
    $scope.note = ""

    $scope.otp = ""
    $scope.otpError = {
        empty: false,
        incorrect: false,
    }
    $scope.transferInfo = {}


    $scope.simulateQuery = false;
    $scope.isDisabled = false;
    $scope.timeout = undefined;
    $scope.querySearch = querySearch;
    $scope.selectedItemChange = selectedItemChange;
    $scope.searchTextChange = searchTextChange;
    $scope.textSearch = "";
    async function querySearch(query) {
        if (!query) { return [] }
        const searchModel = {
            phone: query,
            fullname: query,
            notIds: [Api.user.id],
        }
        const searchOption = {
            per_page: 10,
            page: 1,
        }
        clearTimeout($scope.timeout)
        return new Promise((resolve, reject) => {
            $scope.timeout = setTimeout(() => {
                resolve(Api.getUsers(searchModel, searchOption)
                    .then(res => {
                        const { data } = res.data;
                        if (res.data.code === 1) {
                            const { records } = data
                            return records.map(record => ({ value: record.id, display: `${record.fullname}${record.phone ? `(${record.phone})` : '(not set phone)'}` }))
                        } else {
                            console.log(res);
                            return []
                        }
                    })
                    .catch((error) => { console.log(error); return [] }))
            }, 500)
        })
    }
    function searchTextChange(text) {
        $scope.textSearch = text
        $scope.receiverIdError = {
            empty: false,
            incorrect: false,
        }
    }
    function selectedItemChange(item) {
        $scope.receiverId = item?.value
        $scope.receiverIdError = {
            empty: false,
            incorrect: false,
        }
    }
    const handleStep1 = () => {
        $scope.receiverIdError = {
            empty: !$scope.textSearch,
            incorrect: !!$scope.textSearch && !$scope.receiverId
        }
        const canNext = !!$scope.textSearch && !!$scope.receiverId
        if (canNext) {
            $scope.step += 1
        }
    }
    const handleStep2 = () => {
        $scope.amountMoneyError = {
            empty: !$scope.amountMoney,
            incorrect: !!$scope.amountMoney && (!isNumeric($scope.amountMoney) || Number.parseInt($scope.amountMoney) <= 0),
        }
        const cannext = !$scope.amountMoneyError.empty && !$scope.amountMoneyError.incorrect
        if (!!cannext) {
            $scope.waitingApi = true;
            Api.transfer(Number.parseInt($scope.amountMoney), $scope.note, $scope.receiverId, Api.user)
                .then(res => {
                    const { data } = res.data;
                    if (res?.data?.code == 1) {
                        const { user, transferRecord } = data;
                        Api.user = { ...Api.user, ...user }
                        $scope.transferInfo = transferRecord
                        $scope.step += 1
                        $scope.$apply()
                    } else if (res?.data?.code == -1) {
                        $('.toast-out-money').toast('show')
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
    }
    $scope.handleStep2Change = (key) => {
        if (key === "amountMoney") {
            if (isNumeric($scope.amountMoney)) {
                $scope.amountBalanceAf = $scope.amountBalance - 1.05 * Number.parseInt($scope.amountMoney);
            } else {
                $scope.amountBalanceAf = $scope.amountBalance;
            }
        }
        $scope.amountMoneyError = {
            empty: false,
            incorrect: false,
        }
    }
    const handleStep3 = () => {
        $scope.otpError = {
            empty: !$scope.otp,
            incorrect: false,
        }
        const cannext = !$scope.amountMoneyError.empty && !$scope.amountMoneyError.incorrect
        if (!!cannext) {
            $scope.waitingApi = true;
            Api.transferConfirm($scope.transferInfo.id, $scope.otp, Api.user)
                .then(res => {
                    const { data } = res.data;
                    if (res?.data?.code == 1) {
                        const { user, transferRecord } = data;
                        Api.user = { ...Api.user, ...user };
                        $scope.transferInfo = transferRecord;
                        $scope.amountBalance = Api.user.amountBalance;
                        $scope.step += 1
                        $scope.$apply()
                    } else if (res?.data?.code == -1) {
                        $('.toast-out-money').toast('show')
                    } else if (res?.data?.code == -2) {
                        $scope.otpError = {
                            empty: !$scope.otp,
                            incorrect: true,
                        }
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
    }
    $scope.handleContinute = () => {
        $scope.step = 1
        $scope.card = {
            number: "",
            expired: "",
            cvv: "",
        }
        $scope.cardError = {
            number: {
                empty: false,
                incorrect: false,
            },
            expired: {
                empty: false,
                incorrect: false,
            },
            cvv: {
                empty: false,
                incorrect: false,
            },
        }
        $scope.amountMoney = ""
        $scope.amountMoneyError = {
            empty: false,
            incorrect: false,
        }
        $scope.note = ""
        $scope.otp = ""
        $scope.otpError = {
            empty: false,
            incorrect: false,
        }
    }
    $scope.handleBackHome = () => {
        $location.path('/')
    }
    $scope.handleNext = (e) => {
        if ($scope.step === 1) {
            handleStep1()
        } else if ($scope.step === 2) {
            handleStep2()
        } else if ($scope.step === 3) {
            handleStep3()
        } else if ($scope.step === 4) {
            $scope.step += 1
            //handle step4
        } else {
            //handle other step
        }
    }
}