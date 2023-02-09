const FaceidController = ($scope, $location, Api, $element, $interval, ...arr) => {
    $scope.cameraValid = true;
    $scope.idInterval = undefined;
    $scope.waitingApi = false;
    $scope.srcImage = "";
    $scope.setupCamera = () => {
        return new Promise((resolve, reject) => {
            navigator.getUserMedia =
                navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia ||
                navigator.msGetUserMedia;
            if (navigator.getUserMedia) {
                navigator.getUserMedia(
                    {
                        video: true,
                    },
                    (stream) => {

                        $scope.video.srcObject = stream;
                        $scope.video.addEventListener("loadeddata", resolve);
                        $scope.btncloses.forEach(e => {
                            e.onclick = function () {
                                clearInterval($scope.idInterval?.$$intervalId)
                                stream.getTracks().forEach(function (track) {
                                    track.stop();
                                });
                            }
                        })
                    },
                    (error) => reject(error)
                );
            } else {
                reject();
            }
        });
    };

    $scope.handleStartCheckFaceId = async (e) => {
        $scope.video = angular.element(document.querySelector('.video-faceid'))[0]
        $scope.inputVideo = angular.element(document.querySelector('.no-video-faceid'))[0];
        $scope.btncloses = Array.from(angular.element(document.querySelectorAll('.btn-close-click')))
        try {
            await $scope.setupCamera();
            $scope.video.autoplay = true;
            $scope.video.load();
            $scope.video.classList.remove("display-none");
            angular.element(document.querySelector('.message-cammera'))[0].classList.add("hide")

            let apiDone = true;
            const checkFaceId = async () => {
                if (!apiDone) {
                    return;
                }
                apiDone = false
                $scope.waitingApi = true
                const data = new FormData()
                data.append('image', $scope.takeImage())
                data.append('user', JSON.stringify(Api.user))
                data.append('typeImage', "faceid")
                await Api.verifyFaceid(data)
                    .then(res => {
                        const user = res?.data?.data.user;
                        if (res.data.code == 1) {
                            Api.user = {
                                ...Api.user,
                                ...user,
                                status: STATUS_ACCOUNT.verify_process_face
                            }
                            $scope.btncloses.forEach(e => {
                                e.click()
                            })
                            $location.path("/faceid-process");
                            $scope.$apply();
                            clearInterval($scope.idInterval?.$$intervalId)
                        } else {
                            console.log("Chech faild. Try again");
                        }
                    })
                    .catch(error => {
                        clearInterval($scope.idInterval?.$$intervalId)
                        console.log(error);
                    })
                    .finally(() => {
                        $scope.waitingApi = false
                        apiDone = true
                        $scope.$apply();
                    })
            }
            $scope.idInterval = $interval(checkFaceId, 2500)
        } catch (error) {
            angular.element(document.querySelector('.message-cammera'))[0].classList.remove("hide")
            $scope.inputVideo.classList.remove("display-none")
            $scope.cameraValid = false;
            $scope.$apply()
        }
    }
    $scope.takeImage = () => {
        const canvas = document.createElement("canvas");
        canvas.width = $scope.video.videoWidth;
        canvas.height = $scope.video.videoHeight;
        canvas.getContext('2d')
            .drawImage($scope.video, 0, 0, canvas.width, canvas.height);
        const dataURL = canvas.toDataURL();
        const type = dataURL.substring("data:image/".length, dataURL.indexOf(";base64"))
        const file = dataURLtoFile(dataURL, `Face-` + new Date() + "." + type);
        return file;
    }

    $scope.handleFaceInput = (tag) => {
        $scope.waitingApi = true
        const image = tag.files?.[0]
        $scope.srcImage = (window.URL || window.webkitURL).createObjectURL(image);
        const data = new FormData()
        data.append('image', image);
        data.append('user', JSON.stringify(Api.user))
        data.append('typeImage', "faceid")
        Api.verifyFaceid(data)
            .then(res => {
                if (res.data.code == 1) {
                    Api.user = {
                        ...Api.user,
                        status: STATUS_ACCOUNT.verify_process_face
                    }
                    $location.path("/faceid-process");
                    $scope.$apply();
                } else {
                    console.log("Chech faild. Try again");
                }
            })
            .catch(error => {
                console.log(error);
            })
            .finally(() => {
                $scope.waitingApi = false
                $scope.$apply();
            })
    }
}