$(function () {
    $("#passwordBtn").click(function () {
        const userId = '{{user._id}}';
        const oldpassword = $("#oldpassword").val();
        const newpassword = $("#newpassword").val();
        const newpassword2 = $("#newpassword2").val();
        if (oldpassword === '' || newpassword === '' || newpassword2 === '') {
            toastr.error("Xin hãy nhập đủ thông tin");
            return;
        }
        if (newpassword != newpassword2) {
            toastr.error("Mật khẩu nhập lại không đúng");
            return;
        }
        const body = {
            userId,
            oldpassword,
            newpassword,
        };
        fetch('/account/change-password', {
            method: "PUT",
            headers: { "Content-Type":"application/json" },
            body: JSON.stringify(body),
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                toastr.error(data.error);
            } else {
            $("#passwordModal").modal("hide");
            $("#passwordModal form").trigger('reset');
                toastr.success(data.success);
            }
        })
        .catch(err => console.log(err));
    })

    $("#avatarBtn").click(function () {
        const filename = $('#fileInput').val();
        if (!filename || filename == '') {
            toastr.error("Xin hãy chọn một file hình ảnh");
            return;
        }
        const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];
        const fileExtension = filename.split('.').pop().toLowerCase();
        if ($.inArray(fileExtension, validExtensions) == -1) {
            // Nếu không phải là hình ảnh hợp lệ
            toastr.error("Xin hãy chọn một file hình ảnh");
            // Xóa giá trị của input file để ngăn chọn tệp không hợp lệ
            $('#fileInput').val('');
            return;
        }
        const fileInput = $('#fileInput')[0];
        const formData = new FormData();
        formData.append("type", "profile");
        formData.append("file", fileInput.files[0]);
        const userId = '{{user._id}}';
        fetch(`/account/change-avatar/${userId}`, {
            method: "PUT",
            body: formData,
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                toastr.error(data.error);
            } else {
                $("#avatarModal").modal("hide");
                $('#fileInput').val('');
                $("#userAvatar").attr("src", `/images/profile/${data.success}`)
                toastr.success("Đổi ảnh đại diện thành công");
            }
        })
        .catch(err => console.log(err));
    });
});