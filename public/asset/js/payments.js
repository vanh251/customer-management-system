// ============================================================
// Payment Management - jQuery AJAX
// ============================================================
$(document).ready(function () {
    const API_BASE = '../../api';
    let allPayments = [];
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

    function formatVND(a) { return new Intl.NumberFormat('vi-VN').format(a) + ' ₫'; }
    function formatDate(s) {
        if (!s) return '-';
        const d = new Date(s);
        return d.toLocaleDateString('en-GB',{day:'2-digit',month:'short'})+', '+d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
    }
    function badge(st) {
        const s = (st||'').toUpperCase();
        if (s==='COMPLETED') return '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-secondary-container text-on-secondary-container"><span class="w-1.5 h-1.5 rounded-full bg-on-secondary-container mr-1.5"></span>Hoàn thành</span>';
        if (s==='PENDING') return '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-surface-variant text-on-surface-variant border border-outline-variant"><span class="w-1.5 h-1.5 rounded-full bg-outline mr-1.5"></span>Đang chờ</span>';
        if (s==='FAILED') return '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-error-container text-on-error-container"><span class="w-1.5 h-1.5 rounded-full bg-error mr-1.5"></span>Thất bại</span>';
        return '<span>'+escapeHTML(s)+'</span>';
    }

    function loadPayments() {
        $.ajax({
            url: API_BASE+'/payments/get_payments.php',
            data:{status:$('#statusFilter').val(),method:$('#methodFilter').val(),search:$('#paymentSearch').val().trim()},
            dataType:'json',
            success:function(r){
                if(!r.success) return;
                allPayments = r.data;
                currentPage = 1;
                renderTable();
            },
            error:function(x){if(x.status===401)window.location.href='login.html';}
        });
    }

    function renderTable() {
        let h='';
        const totalItems = allPayments.length;
        const totalPages = Math.ceil(totalItems / limit) || 1;
        
        if (currentPage > totalPages) currentPage = totalPages;

        const startIndex = (currentPage - 1) * limit;
        const endIndex = Math.min(startIndex + limit, totalItems);
        const currentData = allPayments.slice(startIndex, endIndex);

        if(!currentData.length) h='<tr><td colspan="8" class="p-8 text-center text-on-surface-variant">Không có dữ liệu.</td></tr>';
        else currentData.forEach(function(p){
            h+='<tr class="hover:bg-surface-container-low transition-colors group">';
            h+='<td class="p-4 font-data-mono text-data-mono text-on-surface">ORD-'+escapeHTML(String(p.id).padStart(4,'0'))+'</td>';
            h+='<td class="p-4 font-body-sm text-body-sm text-on-surface font-medium">'+escapeHTML(p.customer_name)+'</td>';
            h+='<td class="p-4 font-data-mono text-data-mono text-on-surface text-right">'+formatVND(p.total_amount)+'</td>';
            h+='<td class="p-4 font-body-sm text-body-sm text-on-surface-variant">'+escapeHTML(p.payment_method||'-')+'</td>';
            h+='<td class="p-4">'+badge(p.payment_status)+'</td>';
            h+='<td class="p-4 font-data-mono text-data-mono text-on-surface-variant text-xs">'+escapeHTML(p.transaction_id||'-')+'</td>';
            h+='<td class="p-4 font-body-sm text-body-sm text-on-surface-variant">'+formatDate(p.created_at)+'</td>';
            h+='<td class="p-4 text-right"><div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button class="p-1.5 text-error hover:bg-error-container hover:text-on-error-container rounded-DEFAULT transition-colors btn-delete" data-id="'+escapeHTML(p.id)+'" title="Xóa"><span class="material-symbols-outlined text-[18px]">delete</span></button></div></td>';
            h+='</tr>';
        });
        $('#paymentTableBody').html(h);
        renderPagination(totalItems, totalPages, startIndex, endIndex);
    }

    function renderPagination(totalItems, totalPages, startIndex, endIndex) {
        if (totalItems === 0) {
            $('#paymentPaginationInfo').text(`Hiển thị 0 đến 0 của 0 mục`);
        } else {
            $('#paymentPaginationInfo').text(`Hiển thị ${startIndex + 1} đến ${endIndex} của ${totalItems} mục`);
        }

        let controls = $('#paymentPaginationControls');
        // If paymentPaginationControls doesn't exist, we might need to find the parent container.
        // Looking at HTML, it might be an inline element next to paymentPaginationInfo.
        // Let's replace the whole pagination container if needed.
        if (controls.length === 0) {
            $('#paymentPaginationInfo').next().attr('id', 'paymentPaginationControls');
            controls = $('#paymentPaginationControls');
        }
        
        if (controls.length > 0) {
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
    }

    $('#statusFilter,#methodFilter').on('change',loadPayments);
    let t; $('#paymentSearch').on('keyup',function(){clearTimeout(t);t=setTimeout(loadPayments,350);});
    loadPayments();

    // ============================================================
    // Simple Toast Notification
    // ============================================================
    function showToast(message, type) {
        const bgColor = type === 'success' ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-error-container text-on-error-container';
        const $toast = $(`<div class="fixed top-20 right-6 z-[9999] px-5 py-3 rounded-lg shadow-lg ${bgColor} font-label-md text-label-md transition-all transform translate-x-full">${escapeHTML(message)}</div>`);
        $('body').append($toast);
        setTimeout(() => $toast.removeClass('translate-x-full'), 50);
        setTimeout(() => { $toast.addClass('translate-x-full'); setTimeout(() => $toast.remove(), 300); }, 3000);
    }

    // ============================================================
    // Action Button Handlers
    // ============================================================
    $(document).on('click', '.btn-delete', function() {
        const id = $(this).data('id');
        if (confirm('Bạn có chắc muốn xóa thông tin thanh toán cho đơn hàng #' + id + '? (Hành động này không thể hoàn tác)')) {
            $.ajax({
                url: API_BASE + '/payments/delete_payment.php',
                type: 'POST',
                data: { id },
                dataType: 'json',
                success: function(res) {
                    if (res.success) {
                        showToast(res.message, 'success');
                        loadPayments();
                    } else {
                        showToast(res.message, 'error');
                    }
                },
                error: function(xhr) {
                    showToast('Lỗi server khi xóa.', 'error');
                    console.error(xhr.responseText);
                }
            });
        }
    });
});
