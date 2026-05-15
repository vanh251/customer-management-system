// ============================================================
// Quản lý nhân viên - Xử lý jQuery AJAX
// ============================================================
$(document).ready(function () {
    const API_BASE = '../../api';

    function escapeHTML(str) {
        if (!str) return '';
        return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
    }

    function formatDate(dateStr) {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' });
    }

    let allStaff = [];

    // ---- Tải danh sách nhân viên từ API ----
    function loadStaff(search) {
        const params = search ? { search: search } : {};
        $.ajax({
            url: API_BASE + '/staff/get_staff.php',
            data: params,
            dataType: 'json',
            success: function (res) {
                if (!res.success) return;
                allStaff = res.data;
                renderTable(allStaff);
            },
            error: function (xhr) {
                if (xhr.status === 401) window.location.href = 'login.html';
                if (xhr.status === 403) {
                    alert('Bạn không có quyền truy cập chức năng này.');
                    window.location.href = 'customer-management.html';
                }
            }
        });
    }

    function renderTable(data) {
        let html = '';
        if (data.length === 0) {
            html = '<tr><td colspan="7" class="text-center py-8 text-on-surface-variant">Không có nhân viên nào.</td></tr>';
        }
        data.forEach(function (s) {
            const statusBadge = s.status === 'ACTIVE'
                ? '<span class="inline-flex items-center px-2 py-0.5 rounded-full font-label-sm text-label-sm bg-[#D1FAE5] text-[#065F46]">Hoạt động</span>'
                : '<span class="inline-flex items-center px-2 py-0.5 rounded-full font-label-sm text-label-sm bg-error-container text-on-error-container">Vô hiệu</span>';
            html += `
            <tr class="hover:bg-surface-container-low transition-colors">
                <td class="py-3 px-4 font-data-mono text-data-mono text-on-surface-variant">${s.id}</td>
                <td class="py-3 px-4">
                    <div class="font-label-md text-label-md text-on-surface">${escapeHTML(s.full_name)}</div>
                </td>
                <td class="py-3 px-4 font-body-sm text-body-sm text-on-surface-variant">${escapeHTML(s.email)}</td>
                <td class="py-3 px-4 font-body-sm text-body-sm text-on-surface-variant">${escapeHTML(s.phone || '-')}</td>
                <td class="py-3 px-4 font-data-mono text-data-mono text-on-surface text-center">${s.customer_count || 0}</td>
                <td class="py-3 px-4">${statusBadge}</td>
                <td class="py-3 px-4 text-center">
                    <div class="flex items-center justify-center gap-1">
                        <button class="edit-staff-btn p-1.5 text-secondary hover:bg-surface-variant rounded transition-colors" data-id="${s.id}" title="Sửa">
                            <span class="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button class="delete-staff-btn p-1.5 text-error hover:bg-error-container rounded transition-colors" data-id="${s.id}" data-name="${escapeHTML(s.full_name)}" title="Vô hiệu hóa">
                            <span class="material-symbols-outlined text-sm">person_off</span>
                        </button>
                    </div>
                </td>
            </tr>`;
        });
        $('#staffTableBody').html(html);
        $('#staffCount').text(data.length + ' nhân viên');
    }

    // ---- Xử lý tìm kiếm nhân viên ----
    let searchTimer;
    $('#staffSearch').on('input', function () {
        clearTimeout(searchTimer);
        const val = $(this).val().trim();
        searchTimer = setTimeout(() => loadStaff(val), 300);
    });

    // ---- Xử lý hộp thoại thêm nhân viên ----
    $('#addStaffBtn').on('click', () => { $('#addModal').removeClass('hidden'); $('#addName').focus(); });
    $('#addModalClose, #addModalCancel').on('click', () => $('#addModal').addClass('hidden'));

    $('#addForm').on('submit', function (e) {
        e.preventDefault();
        $.ajax({
            url: API_BASE + '/staff/add_staff.php',
            type: 'POST',
            data: {
                full_name: $('#addName').val(),
                email: $('#addEmail').val(),
                password: $('#addPassword').val(),
                phone: $('#addPhone').val(),
                address: $('#addAddress').val()
            },
            dataType: 'json',
            success: function (res) {
                if (res.success) {
                    $('#addModal').addClass('hidden');
                    $('#addForm')[0].reset();
                    loadStaff();
                } else {
                    alert(res.message);
                }
            }
        });
    });

    // ---- Xử lý hộp thoại sửa thông tin nhân viên ----
    $(document).on('click', '.edit-staff-btn', function () {
        const id = $(this).data('id');
        const s = allStaff.find(x => x.id == id);
        if (!s) return;
        $('#editId').val(s.id);
        $('#editName').val(s.full_name);
        $('#editEmail').val(s.email);
        $('#editPhone').val(s.phone);
        $('#editAddress').val(s.address);
        $('#editModal').removeClass('hidden');
    });
    $('#editModalClose, #editModalCancel').on('click', () => $('#editModal').addClass('hidden'));

    $('#editForm').on('submit', function (e) {
        e.preventDefault();
        $.ajax({
            url: API_BASE + '/staff/update_staff.php',
            type: 'POST',
            data: {
                id: $('#editId').val(),
                full_name: $('#editName').val(),
                email: $('#editEmail').val(),
                phone: $('#editPhone').val(),
                address: $('#editAddress').val()
            },
            dataType: 'json',
            success: function (res) {
                if (res.success) {
                    $('#editModal').addClass('hidden');
                    loadStaff();
                } else {
                    alert(res.message);
                }
            }
        });
    });

    // ---- Xóa / Vô hiệu hóa nhân viên ----
    $(document).on('click', '.delete-staff-btn', function () {
        const id = $(this).data('id');
        const name = $(this).data('name');
        if (!confirm('Bạn có chắc muốn vô hiệu hóa nhân viên "' + name + '"?\nCác khách hàng do nhân viên này phụ trách sẽ bị gỡ phân công.')) return;
        $.ajax({
            url: API_BASE + '/staff/delete_staff.php',
            type: 'POST',
            data: { id: id },
            dataType: 'json',
            success: function (res) {
                if (res.success) loadStaff();
                else alert(res.message);
            }
        });
    });

    // ---- Gọi hàm khởi tạo tải dữ liệu ----
    loadStaff();
});
