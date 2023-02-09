const TransferHistoryController = ($scope, $location, Api, $element) => {
    $scope.waitingApi = false;
    $scope.selectedModel = []
    $scope.searchModel = {
        createdDates: [null, null],
        type: 0
    }
    $scope.datas = []
    $scope.data = {}
    $scope.searchOption = {
        per_page: 10,
        page: 1,
    }
    $scope.pagesView = []
    $scope.checkAll = false
    $scope.checkItemp = []

    $scope.search = () => {
        const searchModel = {
            ...$scope.searchModel,
            createdDates: [
                !!$scope.searchModel.createdDates[0] ? moment($scope.searchModel.createdDates[0]).startOf('day').format("YYYY-MM-DD HH:mm:ss") : null,
                !!$scope.searchModel.createdDates[1] ? moment($scope.searchModel.createdDates[1]).endOf('day').format("YYYY-MM-DD HH:mm:ss") : null
            ],
            userId: Api.user.id
        }
        $scope.waitingApi = true;
        Api.getTransfers(searchModel, $scope.searchOption)
            .then(res => {
                const { data } = res.data;
                if (res.data.code === 1) {
                    const { records, pages, hasNext, hasPrev } = data
                    $scope.datas = records;
                    $scope.searchOption = {
                        ...$scope.searchOption,
                        hasNext,
                        hasPrev,
                        pages
                    }
                    const PAGE_AF = 2;
                    const PAGE_BF = 2;
                    const startPageView = $scope.searchOption.page - PAGE_AF <= 0 ? 1 : $scope.searchOption.page - PAGE_AF
                    const endPageView = $scope.searchOption.page + PAGE_BF > pages ? pages : $scope.searchOption.page + PAGE_BF
                    $scope.pagesView = []
                    for (let i = startPageView; i <= endPageView; i++) {
                        $scope.pagesView.push(i)
                    }
                    $scope.selectedModel = []
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
    $scope.view = (e) => {
        const btn = e.target
        if (!!btn.getAttribute("data-target")) {
            return;
        }
        if ($scope.selectedModel.length === 1) {
            $scope.waitingApi = true;
            Api.getTransferById($scope.selectedModel[0])
                .then(res => {
                    const { data } = res.data;
                    if (res.data.code === 1) {
                        const { transferRecord } = data
                        $scope.data = transferRecord
                        $scope.$apply()
                        btn.setAttribute("data-target", "#exampleModal");
                        btn.click()
                        btn.removeAttribute("data-target")
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
        } else {
            $('.toast-view').toast('show')
        }
    }
    $scope.selectAllOnchange = (e) => {
        if ($scope.checkAll) {
            $scope.selectedModel = []
        } else {
            $scope.selectedModel = $scope.datas.map(item => item.id)
        }
        $scope.checkAll = e.checked
        $scope.$apply()
    }
    $scope.selectItemOnchange = (e) => {
        const id = Number.parseInt(e.value)
        if ($scope.selectedModel.includes(id)) {
            $scope.selectedModel = $scope.selectedModel.filter(_id => _id !== id)
        } else {
            $scope.selectedModel.push(id)
        }
        $scope.checkAll = $scope.datas.length === $scope.selectedModel.length
        $scope.$apply()
    }
    $scope.handleChangePage = (page) => {
        $scope.searchOption.page = page
        $scope.search()
    }
    $scope.handleNextPage = () => {
        $scope.searchOption.page += 1
        $scope.search()
    }
    $scope.handlePreviewPage = () => {
        $scope.searchOption.page -= 1
        $scope.search()
    }
    $scope.search()
}