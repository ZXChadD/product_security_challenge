$(document).ready(function () {
    $('form').submit(function (e) { 
        e.preventDefault();
        let email = $(".login-email").val()
    
        $.ajax({
            type: "POST",
            url: "/api/forget",
            data: {
                "email" : email,
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
        text: 'Please check your email',
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