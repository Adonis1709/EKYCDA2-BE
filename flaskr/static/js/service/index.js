const Api = function ($http) {
    this.user = {
        avatarSrc: "",
        avatarName: "",
        identityCart: "",
        fullName: "",
        dateOfBirth: "",
        sex: "",
        placeOfOrigin: "",
        placeOfResidence: "",
        dateOfExpiry: "",
        email: "",
        fistName: "",
        lastName: "",
        username: "",
        password: "",
        isLogin: "",
        status: undefined,
    }
    this.login = async function (username, password) {
        return $http({
            method: 'POST',
            url: 'auth/login',
            headers: {
                'Content-Type': "application/json"
            },
            data: JSON.stringify({
                username,
                password
            })
        })
            .then(res => {
                return res
            })
            .catch(error => {
                return error
            })
    }
    this.register = async function (user) {
        return $http({
            method: 'POST',
            url: 'auth/register',
            headers: {
                'Content-Type': "application/json"
            },
            data: JSON.stringify(user)
        })
            .then(res => {
                return res
            })
            .catch(error => {
                return error
            })
    }

    this.sendMailVerify = async function (user) {
        return $http({
            method: 'POST',
            url: 'auth/send-email-verify',
            headers: {
                'Content-Type': "application/json"
            },
            data: JSON.stringify({
                ...user
            })
        })
            .then(res => {
                return res
            })
            .catch(error => {
                return error
            })
    }
    this.getUserVerify = async function (user) {
        return $http({
            method: 'POST',
            url: 'auth/get-user-verify',
            headers: {
                'Content-Type': "application/json"
            },
            data: JSON.stringify(user)
        })
            .then(res => {
                return res
            })
            .catch(error => {
                return error
            })
    }

    this.verifyCard = async function (data) {
        return $http({
            method: 'POST',
            url: 'auth/verify-card',
            headers: {
                // 'Content-Type': "application/json"
                'Content-Type': undefined
            },
            data: data
            // data: JSON.stringify({ user })
        })
            .then(res => {
                return res
            })
            .catch(error => {
                return error
            })
    }
    this.verifyFaceid = async function (data) {
        return $http({
            method: 'POST',
            url: 'auth/verify-faceid',
            headers: {
                'Content-Type': undefined
            },
            data: data
        })
            .then(res => {
                return res
            })
            .catch(error => {
                return error
            })
    }

    this.updateAccount = async function (data) {
        return $http({
            method: 'PATCH',
            url: 'user/user',
            headers: {
                'Content-Type': undefined
            },
            data: data
        })
            .then(res => {
                return res
            })
            .catch(error => {
                return error
            })
    }
    this.decode = async function (token) {
        return $http({
            method: 'POST',
            url: 'helper/decode',
            headers: {
                'Content-Type': "application/json"
            },
            data: JSON.stringify({ token })
        })
            .then(res => {
                return res
            })
            .catch(error => {
                return error
            })
    }

    this.topUp = async function (money, note, user) {
        return $http({
            method: 'POST',
            url: 'transfer/top-up',
            headers: {
                'Content-Type': "application/json"
            },
            data: JSON.stringify({ money, user, note })
        })
            .then(res => {
                return res
            })
            .catch(error => {
                return error
            })
    }
    this.getTransferById = async function (id) {
        return $http({
            method: 'GET',
            url: `transfer/transfer/${id}`,
        })
            .then(res => {
                return res
            })
            .catch(error => {
                return error
            })
    }
    this.getUserById = async function (id) {
        return $http({
            method: 'GET',
            url: `user/user/${id}`,
        })
            .then(res => {
                return res
            })
            .catch(error => {
                return error
            })
    }
    this.getTransfers = async function (searchModel, searchOption) {
        return $http({
            method: 'GET',
            url: `transfer/transfers?searchModel=${JSON.stringify(searchModel)}&searchOption=${JSON.stringify(searchOption)}`,
        })
            .then(res => {
                return res
            })
            .catch(error => {
                return error
            })
    }
    this.withdraw = async function (money, note, user) {
        return $http({
            method: 'POST',
            url: 'transfer/withdraw',
            headers: {
                'Content-Type': "application/json"
            },
            data: JSON.stringify({ money, user, note })
        })
            .then(res => {
                return res
            })
            .catch(error => {
                return error
            })
    }
    this.transfer = async function (money, note, receiverId, user) {
        return $http({
            method: 'POST',
            url: 'transfer/transfer',
            headers: {
                'Content-Type': "application/json"
            },
            data: JSON.stringify({ money, note, receiverId, user })
        })
            .then(res => {
                return res
            })
            .catch(error => {
                return error
            })
    }
    this.transferConfirm = async function (transferId, code, user) {
        return $http({
            method: 'POST',
            url: 'transfer/transfer-confirm',
            headers: {
                'Content-Type': "application/json"
            },
            data: JSON.stringify({ transferId, code, user })
        })
            .then(res => {
                return res
            })
            .catch(error => {
                return error
            })
    }
    this.getUsers = async function (searchModel, searchOption) {
        return $http({
            method: 'GET',
            url: `user/users?searchModel=${JSON.stringify(searchModel)}&searchOption=${JSON.stringify(searchOption)}`,
        })
            .then(res => {
                return res
            })
            .catch(error => {
                return error
            })
    }
    this.changePasswoed = async function (oldPassword, newPassword, user) {
        return $http({
            method: 'POST',
            url: 'user/change-password',
            headers: {
                'Content-Type': "application/json"
            },
            data: JSON.stringify({ oldPassword, newPassword, user })
        })
            .then(res => {
                return res
            })
            .catch(error => {
                return error
            })
    }
    this.resetPassword = async function (username, email, otp = '', password = '') {
        return $http({
            method: 'POST',
            url: 'user/reset-password',
            headers: {
                'Content-Type': "application/json"
            },
            data: JSON.stringify({ username, email, otp, password })
        })
            .then(res => {
                return res
            })
            .catch(error => {
                return error
            })
    }
}
