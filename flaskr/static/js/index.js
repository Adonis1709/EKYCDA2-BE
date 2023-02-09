const STATUS_ACCOUNT = {
    verify_email: 0,
    verify_process_email: 1,
    verify_card: 2,
    verify_process_card: 3,
    verify_profile: 4,
    verify_process_profile: 5,
    verify_face: 6,
    verify_process_face: 7,
    done: 8
};

const TYPEOF_OTP = {
    verify: 0,
    transfer: 1,
    topup: 2,
    withdraw: 3,
}
const STATUS_TRANSFER = {
    new: 0,
    completed: 1,
}
const toDataURL = url => fetch(url)
    .then(response => response.blob())
    .then(blob => new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
    }))

function dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
}

const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};

const checkPasswordRule = (str) => {
    const MIN_LENGH = 8;
    if (str.length < MIN_LENGH) {
        return false;
    }
    if (str.search(/[A-Z]/g) < 0) {
        return false;
    }
    if (str.search(/[a-z]/g) < 0) {
        return false;
    }
    if (str.search(/[0-9]/g) < 0) {
        return false;
    }
    return true;
}
