$(document).ready(function () {
    const API_BASE = '../../api';
    let currentOrderId = null;

    function escapeHTML(str) {
        if (!str) return '';
        return String(str).replace(/[&<>"']/g, function(match) {
            const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
            return map[match];
        });
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }

    function formatDate(dateStr) {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleString('vi-VN', { 
            hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' 
        });
    }

    function getStatusBadge(status) {
        const map = {
            'PENDING': '<span class="px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800">Chờ xử lý</span>',
            'PROCESSING': '<span class="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">Đang xử lý</span>',
            'SHIPPED': '<span class="px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-800">Đang giao</span>',
            'DELIVERED': '<span class="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">Đã giao</span>',
            'CANCELLED': '<span class="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-800">Đã hủy</span>'
        };
        return map[status] || `<span class="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800">${status}</span>`;
    }

    function loadOrders() {
        const search = $('#orderSearch').val();
        const status = $('#filterStatus').val();

        console.log('Loading orders...', { search, status });

        $.ajax({
            url: `${API_BASE}/orders/get_orders.php`,
            type: 'GET',
            data: { search, status },
            dataType: 'json',
            success: function (res) {
                console.log('API Response:', res);
                if (res.success) {
                    renderTable(res.data);
                } else {
                    const tbody = $('#orderTableBody');
                    tbody.html(`<tr><td colspan="7" class="text-center py-8 text-error">Lỗi: ${escapeHTML(res.message)}</td></tr>`);
                }
            },
            error: function (xhr, status, error) {
                console.error('AJAX Error:', status, error);
                let errorMsg = 'Lỗi kết nối máy chủ. Vui lòng thử lại sau.';
                try {
                    const res = JSON.parse(xhr.responseText);
                    if (res && res.message) errorMsg = 'Lỗi server: ' + res.message;
                } catch (e) {}
                
                const tbody = $('#orderTableBody');
                tbody.html(`<tr><td colspan="7" class="text-center py-8 text-error">${escapeHTML(errorMsg)}</td></tr>`);
            }
        });
    }

    function renderTable(orders) {
        const tbody = $('#orderTableBody');
        tbody.empty();

        if (!orders || !Array.isArray(orders) || orders.length === 0) {
            tbody.html(`<tr><td colspan="7" class="text-center py-8 text-secondary">Không tìm thấy đơn hàng nào.</td></tr>`);
            return;
        }

        try {
            orders.forEach(o => {
                const tr = $(`
                    <tr class="hover:bg-surface-container-low transition-colors group">
                        <td class="py-3 px-4 text-sm font-mono text-primary">#${escapeHTML(o.id)}</td>
                        <td class="py-3 px-4">
                            <div class="flex flex-col">
                                <span class="text-sm font-medium text-on-surface">${escapeHTML(o.customer_name)}</span>
                                <span class="text-xs text-secondary">${escapeHTML(o.customer_phone)}</span>
                            </div>
                        </td>
                        <td class="py-3 px-4 text-sm font-medium text-right text-on-surface">${formatCurrency(o.total_amount)}</td>
                        <td class="py-3 px-4 text-sm">${(o.payment_status === 'PAID' || o.payment_status === 'COMPLETED') ? '<span class="text-green-600 font-medium">Đã thanh toán</span>' : '<span class="text-orange-600 font-medium">Chưa thanh toán</span>'}</td>
                        <td class="py-3 px-4">${getStatusBadge(o.status)}</td>
                        <td class="py-3 px-4 text-sm text-secondary text-right">${formatDate(o.created_at)}</td>
                        <td class="py-3 px-4 text-center">
                            <button class="p-1.5 text-secondary hover:bg-surface-variant rounded-DEFAULT transition-colors btn-view" data-id="${o.id}" title="Xem chi tiết">
                                <span class="material-symbols-outlined text-sm">visibility</span>
                            </button>
                        </td>
                    </tr>
                `);
                tbody.append(tr);
            });
        } catch (err) {
            console.error('Render error:', err);
            tbody.html(`<tr><td colspan="7" class="text-center py-8 text-error">Lỗi hiển thị dữ liệu.</td></tr>`);
        }
    }

    // Filter Listeners
    let searchTimeout;
    $('#orderSearch').on('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(loadOrders, 300);
    });
    $('#filterStatus').on('change', loadOrders);

    // View Details
    $(document).on('click', '.btn-view', function() {
        currentOrderId = $(this).data('id');
        loadOrderDetail(currentOrderId);
    });

    function loadOrderDetail(id) {
        $.ajax({
            url: `${API_BASE}/orders/get_order_detail.php`,
            type: 'GET',
            data: { order_id: id },
            dataType: 'json',
            success: function (res) {
                if (res.success) {
                    renderOrderDetail(res.data);
                    $('#orderDetailModal').removeClass('hidden');
                } else {
                    alert(res.message);
                }
            },
            error: function(xhr) {
                alert('Lỗi server khi tải chi tiết đơn hàng.');
                console.error(xhr.responseText);
            }
        });
    }

    function renderOrderDetail(data) {
        $('#detailOrderId').text(`#${data.id}`);
        $('#updateStatusSelect').val(data.status);

        let itemsHtml = '';
        data.items.forEach(item => {
            itemsHtml += `
                <div class="flex items-center justify-between py-3 border-b border-outline-variant last:border-0">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 bg-surface-container rounded border border-outline-variant flex items-center justify-center overflow-hidden">
                            ${item.image_url ? `<img src="${item.image_url}" class="w-full h-full object-cover"/>` : '<span class="material-symbols-outlined text-outline">image</span>'}
                        </div>
                        <div class="flex flex-col">
                            <span class="text-sm font-medium text-on-surface">${escapeHTML(item.product_name)}</span>
                            <span class="text-xs text-secondary">SL: ${item.quantity}</span>
                        </div>
                    </div>
                    <span class="text-sm font-medium text-on-surface">${formatCurrency(item.price * item.quantity)}</span>
                </div>
            `;
        });

        $('#orderDetailContent').html(`
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Customer Info -->
                <div class="bg-surface-container p-4 rounded-lg border border-outline-variant">
                    <h4 class="text-sm font-bold text-on-surface mb-3 flex items-center gap-2"><span class="material-symbols-outlined text-sm">person</span> Khách Hàng</h4>
                    <p class="text-sm text-on-surface-variant mb-1"><span class="font-medium text-on-surface">Tên:</span> ${escapeHTML(data.customer_name)}</p>
                    <p class="text-sm text-on-surface-variant mb-1"><span class="font-medium text-on-surface">SĐT:</span> ${escapeHTML(data.customer_phone)}</p>
                    <p class="text-sm text-on-surface-variant mb-1"><span class="font-medium text-on-surface">Email:</span> ${escapeHTML(data.customer_email)}</p>
                    <p class="text-sm text-on-surface-variant"><span class="font-medium text-on-surface">Địa chỉ:</span> ${escapeHTML(data.customer_address)}</p>
                </div>
                <!-- Order Info -->
                <div class="bg-surface-container p-4 rounded-lg border border-outline-variant">
                    <h4 class="text-sm font-bold text-on-surface mb-3 flex items-center gap-2"><span class="material-symbols-outlined text-sm">receipt_long</span> Thông Tin</h4>
                    <p class="text-sm text-on-surface-variant mb-1"><span class="font-medium text-on-surface">Ngày tạo:</span> ${formatDate(data.created_at)}</p>
                    <p class="text-sm text-on-surface-variant mb-1"><span class="font-medium text-on-surface">Trạng thái:</span> ${getStatusBadge(data.status)}</p>
                    <p class="text-sm text-on-surface-variant mb-1"><span class="font-medium text-on-surface">Thanh toán:</span> ${(data.payment_status === 'PAID' || data.payment_status === 'COMPLETED') ? 'Đã thanh toán' : 'Chưa thanh toán'}</p>
                    <p class="text-sm text-on-surface-variant"><span class="font-medium text-on-surface">Tổng tiền:</span> <span class="text-primary font-bold">${formatCurrency(data.total_amount)}</span></p>
                </div>
            </div>
            
            <!-- Items -->
            <div>
                <h4 class="text-sm font-bold text-on-surface mb-3">Sản Phẩm</h4>
                <div class="border border-outline-variant rounded-lg px-4">
                    ${itemsHtml}
                </div>
            </div>
        `);
    }

    // Modal Controls
    $('#closeDetailModalBtn, #closeDetailModalBtn2').on('click', function() {
        $('#orderDetailModal').addClass('hidden');
    });

    $('#saveStatusBtn').on('click', function() {
        const newStatus = $('#updateStatusSelect').val();
        $.ajax({
            url: `${API_BASE}/orders/update_order_status.php`,
            type: 'POST',
            data: { order_id: currentOrderId, status: newStatus },
            dataType: 'json',
            success: function (res) {
                if (res.success) {
                    loadOrders(); // reload list
                    $('#orderDetailModal').addClass('hidden');
                } else {
                    alert(res.message);
                }
            }
        });
    });

    // (User info is now loaded dynamically by auth_guard.js)

    loadOrders();
});
