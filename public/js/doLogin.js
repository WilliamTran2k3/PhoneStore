$('#submitBtn').click(function() {
    const username = $('#username').val();
    const password = $('#password').val();
    if (username == '') {
        toastr.error("Username is required");
        return;
    }
    if (password == '') {
        toastr.error("Password is required");
        return;
    }
    let data = {
        username,
        password,
    };
    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            toastr.error(data.error);
        } else {
            window.location.href = '/';
        }
    })
    .catch(err => {
        console.log(err);
    });
})