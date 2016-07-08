
import 'jquery/dist/jquery'

$(() => {

    $("#login_btn").on('click', (evt) => {
        let user = $("input[name=user]").val()
        let pwd = $("input[name=pwd]").val()

        $.ajax({
            'url': "/karat/loginCheck",
            'type': 'POST',
            'dataType': 'json',
            data: {
                'user': user,
                'pwd': pwd
            }
        })
        .success((res)=>{
            console.log(res)
            if(res['state'] == 'succeed'){

                res['redirect'] ? 
                    location.href = res['redirect'] : 
                    location.href = '/karat'
            }else {
                alert('Login Error!')
            }
        })
        .fail((err)=>{
            console.log(err)
            alert('Login Error')
        })

    })


})