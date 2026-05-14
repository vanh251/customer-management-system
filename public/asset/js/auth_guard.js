// ============================================================
// Auth Guard - Include on every page (except login)
// Checks session, enforces role-based access, updates UI
// ============================================================
(function () {
    const API_BASE = '../../api';
    const currentPage = window.location.pathname.split('/').pop();

    // Pages restricted to ADMIN only
    const ADMIN_ONLY_PAGES = ['staff-management.html'];
    // Default redirect for each role
    const ROLE_REDIRECT = {
        ADMIN: 'admin-dashboard.html',
        STAFF: 'customer-management.html'
    };

    $.ajax({
        url: API_BASE + '/auth/check_admin.php',
        type: 'GET',
        dataType: 'json',
        async: false, // Block page render until auth check completes
        success: function (res) {
            if (!res.success) {
                window.location.href = 'login.html';
                return;
            }
            const role = res.data.role;
            const name = res.data.full_name || 'Người dùng';
            const email = res.data.email || 'N/A';
            const avatar = res.data.avatar_url || '';

            // Block STAFF from admin-only pages
            if (role === 'STAFF' && ADMIN_ONLY_PAGES.includes(currentPage)) {
                window.location.href = ROLE_REDIRECT.STAFF;
                return;
            }

            // Hide admin-only menu items for STAFF
            if (role === 'STAFF') {
                $('[data-role="admin-only"]').hide();
            }

            // Update header profile name and role badge
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

            // Store role globally for other JS to use
            window.__USER_ROLE = role;
            window.__USER_ID = res.data.id;
            window.__USER_NAME = name;
        },
        error: function () {
            window.location.href = 'login.html';
        }
    });
})();
