$(document).ready(function () {
    $('#login-form').submit(function (e) { 
        e.preventDefault();
        let name = $(".login-name").val()
        let password = $(".login-password").val()
    
        $.ajax({
            type: "POST",
            url: "/api/login",
            data: {
                "name" : name,
                "password" : password
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
        text: 'Login successful',
        onClose: function(){
            window.location = ("/home");
        }
    });
}

function dialogFormError(msg){
    Swal.fire({
        title: 'Error',
        text: msg,
    });
}