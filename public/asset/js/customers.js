$(document).ready(function () {
    const API_BASE = '../../api';
    let customersData = [];
    let currentPage = 1;
    const limit = 10;
    
    function escapeHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatDate(dateStr) {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

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
                                <button class="p-1.5 text-primary hover:bg-primary-container rounded-DEFAULT transition-colors btn-timeline" data-id="${c.id}" title="Lịch sử tương tác">
                                    <span class="material-symbols-outlined text-sm">history</span>
                                </button>
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

    // Filters
    function applyFilters() {
        const search = $('#customerSearch').val();
        const tier = $('#filterTier').val();
        const status = $('#filterStatus').val();
        // optionally add group if needed later
        loadCustomers(search, tier, '', status);
    }

    let searchTimeout;
    $('#customerSearch').on('input', function () {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(applyFilters, 300);
    });

    $('#filterTier, #filterStatus').on('change', applyFilters);

    // Modals
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

    // Add submit
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

    // Edit open
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

    // Edit submit
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

    // Delete customer
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

    // Timeline features
    function loadTimeline(customerId) {
        $.ajax({
            url: `${API_BASE}/customers/get_activities.php`,
            type: 'GET',
            data: { customer_id: customerId },
            dataType: 'json',
            success: function (res) {
                if (res.success) {
                    renderTimeline(res.data);
                } else {
                    alert('Lỗi tải lịch sử tương tác.');
                }
            }
        });
    }

    function renderTimeline(activities) {
        const list = $('#timelineList');
        list.empty();
        
        if (activities.length === 0) {
            list.html('<p class="text-sm text-secondary ml-4">Chưa có lịch sử tương tác.</p>');
            return;
        }

        activities.forEach(a => {
            let icon = 'info';
            let color = 'bg-surface-variant text-on-surface-variant';
            
            if (a.type === 'CALL') { icon = 'call'; color = 'bg-primary-container text-on-primary-container'; }
            else if (a.type === 'MEETING') { icon = 'groups'; color = 'bg-[#FEF08A] text-[#854D0E]'; }
            else if (a.type === 'EMAIL') { icon = 'mail'; color = 'bg-[#E0E7FF] text-[#3730A3]'; }
            else if (a.type === 'NOTE') { icon = 'sticky_note_2'; color = 'bg-secondary-container text-on-secondary-container'; }

            const item = $(`
                <div class="relative pl-6">
                    <span class="absolute -left-4 top-1 w-8 h-8 rounded-full flex items-center justify-center border-4 border-surface-container-lowest ${color}">
                        <span class="material-symbols-outlined text-sm">${icon}</span>
                    </span>
                    <div class="bg-surface-container-low rounded-lg p-3">
                        <div class="flex justify-between items-start mb-1">
                            <h4 class="font-label-md text-label-md text-on-surface font-semibold">${escapeHTML(a.title)}</h4>
                            <span class="text-xs text-secondary whitespace-nowrap ml-2">${formatDate(a.created_at)}</span>
                        </div>
                        <p class="font-body-sm text-body-sm text-on-surface-variant mb-2">${escapeHTML(a.description || '')}</p>
                        <p class="text-xs text-secondary font-medium">Bởi: ${escapeHTML(a.staff_name)}</p>
                    </div>
                </div>
            `);
            list.append(item);
        });
    }

    $(document).on('click', '.btn-timeline', function() {
        const id = $(this).data('id');
        $('#timelineCustomerId').val(id);
        $('#timelineOverlay').removeClass('hidden');
        setTimeout(() => $('#timelinePanel').removeClass('translate-x-full'), 10);
        loadTimeline(id);
    });

    $('#closeTimelineBtn, #timelineOverlay').on('click', function() {
        $('#timelinePanel').addClass('translate-x-full');
        setTimeout(() => $('#timelineOverlay').addClass('hidden'), 300);
    });

    $('#addActivityForm').on('submit', function(e) {
        e.preventDefault();
        const cid = $('#timelineCustomerId').val();
        
        $.ajax({
            url: `${API_BASE}/customers/add_activity.php`,
            type: 'POST',
            data: {
                customer_id: cid,
                type: $('#activityType').val(),
                title: $('#activityTitle').val().trim(),
                description: $('#activityDesc').val().trim()
            },
            dataType: 'json',
            success: function (res) {
                if (res.success) {
                    $('#addActivityForm')[0].reset();
                    loadTimeline(cid);
                } else {
                    alert(res.message);
                }
            }
        });
    });

    // Initial load
    loadCustomers();
});
