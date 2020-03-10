$(document).ready(function () {
    $('form').submit(function (e) { 
        e.preventDefault();
        let password = $(".login-password").val();
        let confirmPassword = $(".confirm-password").val();
        let resetToken = $(".reset-token").val();

        let checkPassword = checkPwd(password)
        if(checkPassword !== 1){
            Swal.fire("wrong format")
        }
    
        $.ajax({
            type: "POST",
            url: "/api/reset",
            data: {
                "password" : password,
                "confirmPassword" : confirmPassword,
                "resetToken": resetToken
            },
            dataType: "json",
            timeout: 15000,
            success: dialogFormSuccess,
            error: function (err){
                if (err.responseJSON){
                    dialogFormError(err.responseJSON.message);
                } else{
                    dialogFormError("Something went wrong, please try again!")
                }
            }
        });       
    });
});

function dialogFormSuccess(){
    Swal.fire({
        title: 'Success',
        text: 'Please login',
        onClose: function(){
            window.location = ("/login");
        }
    });
}

function dialogFormError(msg){
    Swal.fire({
        title: 'Error',
        text: msg,
    });
}

function checkPwd(str) {
    if (str.length < 8) {
        return 0;
    } else if (str.search(/\d/) == -1) {
        return 0;
    } else if (str.search(/[a-z]/) == -1) {
        return 0;
    } else if (str.search(/[A-Z]/) == -1) {
        return 0;
    }
    return 1;
}