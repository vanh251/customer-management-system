// ============================================================
// Auth Guard - Tích hợp trên mọi trang (ngoại trừ trang đăng nhập)
// Kiểm tra phiên đăng nhập (session), thực thi quyền truy cập dựa trên vai trò, cập nhật giao diện
// ============================================================
(function () {
    const API_BASE = '../../api';
    const currentPage = window.location.pathname.split('/').pop();

    // Các trang chỉ dành cho quản trị viên (ADMIN)
    const ADMIN_ONLY_PAGES = ['staff-management.html'];
    // Điều hướng mặc định tương ứng cho từng vai trò
    const ROLE_REDIRECT = {
        ADMIN: 'admin-dashboard.html',
        STAFF: 'customer-management.html'
    };

    $.ajax({
        url: API_BASE + '/auth/check_admin.php',
        type: 'GET',
        dataType: 'json',
        async: false, // Chặn (block) việc hiển thị trang cho đến khi kiểm tra quyền hoàn tất
        success: function (res) {
            if (!res.success) {
                window.location.href = 'login.html';
                return;
            }
            const role = res.data.role;
            const name = res.data.full_name || 'Người dùng';
            const email = res.data.email || 'N/A';
            const avatar = res.data.avatar_url || '';

            // Chặn nhân viên (STAFF) truy cập vào các trang dành riêng cho ADMIN
            if (role === 'STAFF' && ADMIN_ONLY_PAGES.includes(currentPage)) {
                window.location.href = ROLE_REDIRECT.STAFF;
                return;
            }

            // Ẩn các menu/tính năng chỉ dành cho ADMIN nếu người dùng là STAFF
            if (role === 'STAFF') {
                $('[data-role="admin-only"]').hide();
            }

            // Cập nhật tên, vai trò và email của người dùng trên thanh header
            $('.auth-user-name').text(name);
            $('.auth-user-role').text(role === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên');
            $('.auth-user-email').text(email);
            
            if (avatar) {
                $('.auth-user-avatar-img').attr('src', avatar).show();
                $('.auth-user-avatar-text').hide();
            } else {
                $('.auth-user-avatar-img').hide();
                $('.auth-user-avatar-text').text(name.charAt(0).toUpperCase()).show();
            }

            // Lưu trữ thông tin vai trò ở biến toàn cục để các script khác có thể sử dụng
            window.__USER_ROLE = role;
            window.__USER_ID = res.data.id;
            window.__USER_NAME = name;
        },
        error: function () {
            window.location.href = 'login.html';
        }
    });
})();
