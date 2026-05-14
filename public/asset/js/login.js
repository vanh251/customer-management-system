// ============================================================
// Login Page - jQuery AJAX
// ============================================================
$(document).ready(function () {

    // Determine the base API path relative to the HTML file
    const API_BASE = '../../api';

    $('#loginForm').on('submit', function (e) {
        e.preventDefault();

        const email = $('#email').val().trim();
        const password = $('#password').val();
        const $btn = $(this).find('button[type="submit"]');
        const $error = $('#loginError');

        // Clear previous error
        $error.addClass('hidden').text('');

        // Validate
        if (!email || !password) {
            $error.removeClass('hidden').text('Vui lòng nhập đầy đủ email và mật khẩu.');
            return;
        }

        // Disable button during request
        $btn.prop('disabled', true).text('Đang đăng nhập...');

        $.ajax({
            url: API_BASE + '/auth/login_api.php',
            type: 'POST',
            data: { email: email, password: password },
            dataType: 'json',
            success: function (res) {
                if (res.success) {
                    // Show success then redirect
                    $error.removeClass('hidden')
                          .removeClass('text-error bg-error-container')
                          .addClass('text-[#065F46] bg-[#D1FAE5]')
                          .text(res.message);
                    setTimeout(function () {
                        const role = res.data && res.data.role;
                        if (role === 'STAFF') {
                            window.location.href = 'customer-management.html';
                        } else {
                            window.location.href = 'admin-dashboard.html';
                        }
                    }, 800);
                } else {
                    $error.removeClass('hidden').text(res.message);
                    $btn.prop('disabled', false).text('Đăng Nhập');
                }
            },
            error: function (xhr) {
                let msg = 'Có lỗi xảy ra. Vui lòng thử lại.';
                try {
                    const res = JSON.parse(xhr.responseText);
                    if (res.message) msg = res.message;
                } catch (e) {}
                $error.removeClass('hidden').text(msg);
                $btn.prop('disabled', false).text('Đăng Nhập');
            }
        });
    });
});
