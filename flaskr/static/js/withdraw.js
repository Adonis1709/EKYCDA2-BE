
const CARD = { //Không giới hạn số lần nạp và số tiền mỗi lần nạp.
    number: "111111",
    expired: "10/3/2023",
    cvv: "411",
}
function isNumeric(str) {
    if (typeof str == "number") return true // we only process strings!  
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}
const WithdrawController = ($scope, $location, Api, $element) => {
    $scope.amountBalance = Api.user.amountBalance;
    $scope.amountBalanceAf = Api.user.amountBalance;

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
        div50k: false,
    }
    $scope.note = ""

    const handleStep1 = () => {
        const searchModel = {
            createdDates: [moment().startOf('day').format("YYYY-MM-DD HH:mm:ss"), moment().endOf('day').format("YYYY-MM-DD HH:mm:ss")],
            typeOf: TYPEOF_OTP.withdraw,
            userId: Api.user.id
        }
        const searchOption = {
            page: 1,
            per_page: 10,
        }
        $scope.cardError = {
            number: {
                empty: !$scope.card.number,
                incorrect: !!$scope.card.number && CARD.number != $scope.card.number,
            },
            expired: {
                empty: !$scope.card.expired,
                incorrect: !!$scope.card.expired && CARD.expired != $scope.card.expired,
            },
            cvv: {
                empty: !$scope.card.cvv,
                incorrect: !!$scope.card.cvv && CARD.cvv != $scope.card.cvv,
            }
        }
        const cannext = CARD.number == $scope.card.number
            && CARD.expired == $scope.card.expired
            && CARD.cvv == $scope.card.cvv
        if (cannext) {
            Api.getTransfers(searchModel, searchOption)
                .then(res => {
                    const { data } = res.data;
                    if (res.data.code === 1) {
                        const { records, pages, hasNext, hasPrev } = data
                        if (records.length < 2) {
                            $scope.step += 1
                            $scope.$apply()
                        } else {
                            $('.toast-times-out').toast('show')
                        }
                    }
                    console.log(res);
                })
                .catch(error => {
                    console.log(error);
                })
        }
    }
    $scope.handleStep1Change = (lable) => {
        $scope.cardError[lable].empty = false
        $scope.cardError[lable].incorrect = false
    }
    const handleStep2 = () => {
        $scope.amountMoneyError = {
            empty: !$scope.amountMoney,
            incorrect: !!$scope.amountMoney && (!isNumeric($scope.amountMoney) || Number.parseInt($scope.amountMoney) <= 0),
            div50k: !!$scope.amountMoney && !(!isNumeric($scope.amountMoney) || Number.parseInt($scope.amountMoney) <= 0) && Number.parseInt($scope.amountMoney) % 50000 != 0
        }
        const cannext = !$scope.amountMoneyError.empty && !$scope.amountMoneyError.incorrect && Number.parseInt($scope.amountMoney) % 50000 == 0
        if (!!cannext) {
            $scope.waitingApi = true;
            Api.withdraw(Number.parseInt($scope.amountMoney), $scope.note, Api.user)
                .then(res => {
                    const { data } = res.data;
                    if (res?.data?.code == 1) {
                        const { user, transferRecord } = data;
                        Api.user = { ...Api.user, ...user }
                        $scope.transferInfo = transferRecord
                        $scope.amountBalance = Api.user.amountBalance;
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
        //donnothing
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
        $scope.amountBalance = Api.user.amountBalance;
        $scope.amountBalanceAf = Api.user.amountBalance;
    }
    $scope.handleBackHome = () => {
        $location.path('/')
    }
    $scope.handleNext = (e) => {
        if ($scope.step === 1) {
            handleStep1()
        } else if ($scope.step === 2) {
            handleStep2()
        } else if ($scope.step === 3) { // not run
            handleStep3()
        } else {
            //handle other step
        }
    }
}