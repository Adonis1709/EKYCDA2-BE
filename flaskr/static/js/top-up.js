const CARDS = [{ //Không giới hạn số lần nạp và số tiền mỗi lần nạp.
    number: "111111",
    expired: "10/03/2023",
    cvv: "411",
}, { //Không giới hạn số lần nạp nhưng chỉ được nạp tối đa 1 triệu/lần
    number: "222222",
    expired: "11/03/2023",
    cvv: "443",
}, { //Khi nạp bằng thẻ này thì luôn nhận được thông báo là “thẻ hết tiền”
    number: "333333",
    expired: "12/03/2023",
    cvv: "577",
}]
function isNumeric(str) {
    if (typeof str == "number") return true // we only process strings!  
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}
const TopupController = ($scope, $location, Api, $element) => {
    $scope.waitingApi = false;

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
    }
    $scope.note = ""
    $scope.transferInfo = {}

    const handleStep1 = () => {
        $scope.cardError = {
            number: {
                empty: !$scope.card.number,
                incorrect: !!$scope.card.number && !CARDS.some(card => card.number == $scope.card.number),
            },
            expired: {
                empty: !$scope.card.expired,
                incorrect: !!$scope.card.expired && !CARDS.some(card => card.expired == $scope.card.expired),
            },
            cvv: {
                empty: !$scope.card.cvv,
                incorrect: !!$scope.card.cvv && !CARDS.some(card => card.cvv == $scope.card.cvv),
            }
        }
        const cannext = CARDS.some(card => card.number == $scope.card.number)
            && CARDS.some(card => card.expired == $scope.card.expired)
            && CARDS.some(card => card.cvv == $scope.card.cvv)
        if (cannext) {
            const indexCard = CARDS.findIndex(card => card.number == $scope.card.number)
            if (indexCard == 2) {
                $('.toast-out-money').toast('show')
            } else {
                $scope.step += 1
            }
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
        }
        const indexCard = CARDS.findIndex(card => card.number == $scope.card.number)
        const cannext = !$scope.amountMoneyError.empty && !$scope.amountMoneyError.incorrect
        if (!!cannext) {
            if (indexCard == 1 && Number.parseInt($scope.amountMoney) > 1000000) {
                $('.toast-times-out').toast('show')
            } else { //card 0 or card 1 and $scope.amountMoney <= 1000000
                $scope.waitingApi = true;
                Api.topUp(Number.parseInt($scope.amountMoney), $scope.note, Api.user)
                    .then(res => {
                        const { data } = res.data;
                        if (res?.data?.code == 1) {
                            const { user, transferRecord } = data;
                            Api.user = { ...Api.user, ...user }
                            $scope.amountBalance = Api.user.amountBalance;
                            $scope.transferInfo = transferRecord
                            $scope.step += 1
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
        } else {

        }
    }
    $scope.handleStep2Change = (key) => {
        if (key === "amountMoney") {
            if (isNumeric($scope.amountMoney)) {
                $scope.amountBalanceAf = $scope.amountBalance + Number.parseInt($scope.amountMoney);
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
        //do nothing
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