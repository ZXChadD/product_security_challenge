$(document).ready(function () {
    $('form').submit(function (e) { 
        e.preventDefault();
        let name = $(".login-name").val();
        let password = $(".login-password").val();
        let email = $(".login-email").val();
        let confirmPassword = $(".confirm-password").val();
        
        let checkPassword = checkPwd(password)
        if(checkPassword !== 1){
            Swal.fire("wrong format")
        }

        $.ajax({
            type: "POST",
            url: "/api/register",
            data: {
                "name" : name,
                "password" : password,
                "email" : email,
                "confirmPassword" : confirmPassword
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
        text: 'Register successful',
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