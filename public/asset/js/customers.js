$(document).ready(function () {
    const API_BASE = '../../api';
    let customersData = [];
    let currentPage = 1;
    const limit = 10;
    
    // ---- Hàm hỗ trợ: Mã hóa HTML để tránh XSS ----
    function escapeHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // ---- Hàm hỗ trợ: Định dạng ngày tháng ----
    function formatDate(dateStr) {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    // Gọi API để tải danh sách khách hàng dựa trên tìm kiếm và bộ lọc
    function loadCustomers(search = '', tier = '', group = '', status = '') {
        $.ajax({
            url: `${API_BASE}/customers/get_customers.php`,
            type: 'GET',
            data: { search: search, tier: tier, group: group, status: status },
            dataType: 'json',
            success: function (res) {
                if (res.success) {
                    customersData = res.data;
                    currentPage = 1;
                    renderTable();
                } else {
                    alert(res.message || 'Lỗi tải dữ liệu');
                }
            },
            error: function (xhr) {
                if (xhr.status === 401) {
                    window.location.href = 'login.html';
                } else {
                    alert('Lỗi kết nối máy chủ');
                }
            }
        });
    }

    // Hiển thị danh sách khách hàng ra bảng HTML
    function renderTable() {
        const tbody = $('#customerTableBody');
        tbody.empty();

        const totalItems = customersData.length;
        const totalPages = Math.ceil(totalItems / limit) || 1;
        
        if (currentPage > totalPages) currentPage = totalPages;

        const startIndex = (currentPage - 1) * limit;
        const endIndex = Math.min(startIndex + limit, totalItems);
        const currentData = customersData.slice(startIndex, endIndex);

        if (currentData.length === 0) {
            tbody.html(`<tr><td colspan="8" class="text-center py-8 text-on-surface-variant">Không tìm thấy khách hàng nào.</td></tr>`);
        } else {
            currentData.forEach(c => {
                let tierBadge = '<span class="px-2 py-0.5 rounded-full font-label-sm text-label-sm bg-surface-variant text-on-surface-variant">Chưa có hạng</span>';
                if (c.customer_tier === 'SILVER') tierBadge = '<span class="px-2 py-0.5 rounded-full font-label-sm text-label-sm bg-[#E2E8F0] text-[#475569]">Bạc</span>';
                else if (c.customer_tier === 'GOLD') tierBadge = '<span class="px-2 py-0.5 rounded-full font-label-sm text-label-sm bg-[#FEF08A] text-[#854D0E]">Vàng</span>';
                else if (c.customer_tier === 'PLATINUM') tierBadge = '<span class="px-2 py-0.5 rounded-full font-label-sm text-label-sm bg-[#E0E7FF] text-[#3730A3]">Bạch kim</span>';
                else if (c.customer_tier === 'DIAMOND') tierBadge = '<span class="px-2 py-0.5 rounded-full font-label-sm text-label-sm bg-[#CCFBF1] text-[#115E59]">Kim cương</span>';

                let statusBadge = c.status === 'ACTIVE' 
                    ? '<span class="px-2 py-0.5 rounded-full font-label-sm text-label-sm bg-[#D1FAE5] text-[#065F46]">Hoạt động</span>'
                    : '<span class="px-2 py-0.5 rounded-full font-label-sm text-label-sm bg-error-container text-on-error-container">Vô hiệu</span>';

                const tr = $(`
                    <tr class="hover:bg-surface-container-low transition-colors group">
                        <td class="py-3 px-4 font-data-mono text-data-mono text-on-surface">${escapeHTML(c.id)}</td>
                        <td class="py-3 px-4">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center font-label-sm font-bold text-on-primary-container">
                                    ${escapeHTML(c.full_name).charAt(0).toUpperCase()}
                                </div>
                                <div class="flex flex-col">
                                    <span class="font-label-md text-label-md text-on-surface">${escapeHTML(c.full_name)}</span>
                                    <span class="text-xs text-secondary truncate max-w-[150px]" title="${escapeHTML(c.tags)}">${escapeHTML(c.tags || '')}</span>
                                </div>
                            </div>
                        </td>
                        <td class="py-3 px-4">
                            <div class="flex flex-col">
                                <span class="font-body-sm text-body-sm text-on-surface">${escapeHTML(c.phone) || '-'}</span>
                                <span class="text-xs text-secondary">${escapeHTML(c.email)}</span>
                            </div>
                        </td>
                        <td class="py-3 px-4">${tierBadge}</td>
                        <td class="py-3 px-4 font-body-sm text-body-sm text-on-surface-variant">${escapeHTML(c.staff_name || '-')}</td>
                        <td class="py-3 px-4">${statusBadge}</td>
                        <td class="py-3 px-4 font-body-sm text-body-sm text-on-surface-variant text-right">${formatDate(c.created_at)}</td>
                        <td class="py-3 px-4 text-center">
                            <div class="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button class="p-1.5 text-secondary hover:bg-surface-variant rounded-DEFAULT transition-colors btn-edit" data-id="${c.id}" title="Chỉnh sửa">
                                    <span class="material-symbols-outlined text-sm">edit</span>
                                </button>
                                <button class="p-1.5 text-error hover:bg-error-container hover:text-on-error-container rounded-DEFAULT transition-colors btn-delete" data-id="${c.id}" data-name="${escapeHTML(c.full_name)}" title="Xóa">
                                    <span class="material-symbols-outlined text-sm">delete</span>
                                </button>
                            </div>
                        </td>
                    </tr>
                `);
                
                tr.find('.btn-edit').data('customer', c);
                tbody.append(tr);
            });
        }

        renderPagination(totalItems, totalPages, startIndex, endIndex);
    }

    // Hiển thị và xử lý phân trang cho bảng khách hàng
    function renderPagination(totalItems, totalPages, startIndex, endIndex) {
        if (totalItems === 0) {
            $('#paginationInfo').text(`Hiển thị 0 đến 0 của 0 mục`);
        } else {
            $('#paginationInfo').text(`Hiển thị ${startIndex + 1} đến ${endIndex} của ${totalItems} mục`);
        }

        const controls = $('#paginationControls');
        controls.empty();

        const btnPrev = $(`
            <button class="w-8 h-8 flex items-center justify-center rounded-DEFAULT border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <span class="material-symbols-outlined text-sm">chevron_left</span>
            </button>
        `).prop('disabled', currentPage === 1).on('click', () => {
            if (currentPage > 1) { currentPage--; renderTable(); }
        });
        controls.append(btnPrev);

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                const btnPage = $(`
                    <button class="w-8 h-8 flex items-center justify-center rounded-DEFAULT font-label-sm text-label-sm transition-colors
                        ${i === currentPage ? 'bg-primary text-on-primary' : 'border border-outline-variant text-on-surface hover:bg-surface-container-low'}">
                        ${i}
                    </button>
                `).on('click', () => {
                    currentPage = i; renderTable();
                });
                controls.append(btnPage);
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                controls.append(`<span class="px-1 text-outline">...</span>`);
            }
        }

        const btnNext = $(`
            <button class="w-8 h-8 flex items-center justify-center rounded-DEFAULT border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <span class="material-symbols-outlined text-sm">chevron_right</span>
            </button>
        `).prop('disabled', currentPage === totalPages).on('click', () => {
            if (currentPage < totalPages) { currentPage++; renderTable(); }
        });
        controls.append(btnNext);
    }

    // ============================================================
    // Bộ lọc và Tìm kiếm (Filters & Search)
    // ============================================================
    function applyFilters() {
        const search = $('#customerSearch').val();
        const tier = $('#filterTier').val();
        const status = $('#filterStatus').val();
        // Có thể thêm phân loại theo nhóm (group) nếu cần thiết sau này
        loadCustomers(search, tier, '', status);
    }

    let searchTimeout;
    $('#customerSearch').on('input', function () {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(applyFilters, 300);
    });

    $('#filterTier, #filterStatus').on('change', applyFilters);

    // ============================================================
    // Xử lý các hộp thoại (Modals)
    // ============================================================
    $('#addCustomerBtn').on('click', function () {
        $('#addForm')[0].reset();
        $('#addModal').removeClass('hidden');
    });

    $('#addModalClose, #addModalCancel').on('click', function () {
        $('#addModal').addClass('hidden');
    });

    $('#editModalClose, #editModalCancel').on('click', function () {
        $('#editModal').addClass('hidden');
    });

    // Xử lý Gửi form Thêm mới khách hàng
    $('#addForm').on('submit', function (e) {
        e.preventDefault();
        const data = {
            full_name: $('#addName').val().trim(),
            email: $('#addEmail').val().trim(),
            password: $('#addPassword').val().trim(),
            phone: $('#addPhone').val().trim(),
            address: $('#addAddress').val().trim(),
            birthday: $('#addBirthday').val(),
            customer_source: $('#addSource').val(),
            customer_group: $('#addGroup').val(),
            customer_tier: $('#addTier').val(),
            tags: $('#addTags').val().trim(),
            status: $('#addStatus').val()
        };

        $.ajax({
            url: `${API_BASE}/customers/add_customer.php`,
            type: 'POST',
            data: data,
            dataType: 'json',
            success: function (res) {
                if (res.success) {
                    $('#addModal').addClass('hidden');
                    applyFilters();
                } else {
                    alert(res.message);
                }
            },
            error: function () {
                alert('Có lỗi xảy ra khi thêm khách hàng.');
            }
        });
    });

    // Mở hộp thoại Chỉnh sửa khách hàng và điền dữ liệu cũ
    $(document).on('click', '.btn-edit', function () {
        const c = $(this).data('customer');
        $('#editId').val(c.id);
        $('#editName').val(c.full_name);
        $('#editEmail').val(c.email);
        $('#editPhone').val(c.phone);
        $('#editAddress').val(c.address);
        $('#editBirthday').val(c.birthday || '');
        $('#editSource').val(c.customer_source || '');
        $('#editGroup').val(c.customer_group || '');
        $('#editTier').val(c.customer_tier || 'NONE');
        $('#editStatus').val(c.status || 'ACTIVE');
        $('#editTags').val(c.tags || '');
        
        $('#editModal').removeClass('hidden');
    });

    // Xử lý Gửi form Chỉnh sửa khách hàng
    $('#editForm').on('submit', function (e) {
        e.preventDefault();
        const data = {
            id: $('#editId').val(),
            full_name: $('#editName').val().trim(),
            email: $('#editEmail').val().trim(),
            phone: $('#editPhone').val().trim(),
            address: $('#editAddress').val().trim(),
            birthday: $('#editBirthday').val(),
            customer_source: $('#editSource').val(),
            customer_group: $('#editGroup').val(),
            customer_tier: $('#editTier').val(),
            tags: $('#editTags').val().trim(),
            status: $('#editStatus').val()
        };

        $.ajax({
            url: `${API_BASE}/customers/update_customer.php`,
            type: 'POST',
            data: data,
            dataType: 'json',
            success: function (res) {
                if (res.success) {
                    $('#editModal').addClass('hidden');
                    applyFilters();
                } else {
                    alert(res.message);
                }
            },
            error: function () {
                alert('Có lỗi xảy ra khi cập nhật khách hàng.');
            }
        });
    });

    // Xóa khách hàng
    $(document).on('click', '.btn-delete', function() {
        const id = $(this).data('id');
        const name = $(this).data('name');
        
        if (confirm(`Bạn có chắc chắn muốn xóa khách hàng "${name}" không?\nLưu ý: Không thể xóa nếu khách hàng đã có đơn hàng.`)) {
            $.ajax({
                url: `${API_BASE}/customers/delete_customer.php`,
                type: 'POST',
                data: { id: id },
                dataType: 'json',
                success: function(res) {
                    if (res.success) {
                        applyFilters(); // Reload table
                    } else {
                        alert(res.message);
                    }
                },
                error: function(xhr) {
                    let msg = 'Có lỗi xảy ra khi xóa khách hàng.';
                    try {
                        const res = JSON.parse(xhr.responseText);
                        if (res.message) msg = res.message;
                    } catch (e) {}
                    alert(msg);
                }
            });
        }
    });

    // Gọi hàm khởi tạo để tải dữ liệu khi trang vừa mở
    loadCustomers();
});
