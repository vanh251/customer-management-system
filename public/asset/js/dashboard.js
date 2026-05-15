// ============================================================
// Dashboard - Xử lý dữ liệu jQuery AJAX (Cho admin-dashboard.html + index.html)
// ============================================================
$(document).ready(function () {

    const API_BASE = '../../api';

    function escapeHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // ---- Hàm hỗ trợ: Định dạng tiền tệ VNĐ ----
    function formatVND(amount) {
        return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
    }

    // ---- Hàm hỗ trợ: Định dạng ngày tháng ----
    function formatDate(dateStr) {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    // ---- Hàm hỗ trợ: Lấy chữ cái đầu tiên của tên (để làm Avatar) ----
    function getInitial(name) {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        return parts[parts.length - 1].charAt(0).toUpperCase();
    }

    // ============================================================
    // admin-dashboard.html: Tải và hiển thị các thẻ thống kê (Stats Cards)
    // ============================================================
    function renderGrowth(idPrefix, growth) {
        const container = $(`#${idPrefix}-growth-container`);
        const icon = $(`#${idPrefix}-icon`);
        const text = $(`#${idPrefix}-growth`);

        container.removeClass('text-[#059669] text-error text-[#D97706] text-slate-500');

        if (growth > 0) {
            container.addClass('text-[#059669]');
            icon.text('trending_up');
            text.text(`+${growth}% so với tháng trước`);
        } else if (growth < 0) {
            container.addClass('text-error');
            icon.text('trending_down');
            text.text(`${growth}% so với tháng trước`);
        } else {
            container.addClass('text-[#D97706]');
            icon.text('remove');
            text.text('Không đổi');
        }
    }

    if ($('#stat-revenue').length) {
        $.ajax({
            url: API_BASE + '/dashboard/get_stats.php',
            type: 'GET',
            dataType: 'json',
            success: function (res) {
                if (res.success) {
                    const d = res.data;
                    $('#stat-revenue').text(formatVND(d.revenue.value));
                    renderGrowth('stat-revenue', d.revenue.growth);

                    $('#stat-customers').text(new Intl.NumberFormat('vi-VN').format(d.new_customers.value));
                    renderGrowth('stat-customers', d.new_customers.growth);

                    $('#stat-orders').text(new Intl.NumberFormat('vi-VN').format(d.new_orders.value));
                    renderGrowth('stat-orders', d.new_orders.growth);

                    $('#stat-tickets').text(new Intl.NumberFormat('vi-VN').format(d.open_tickets.value));
                    // Số lượng ticket đang mở không cần hiển thị % tăng trưởng
                }
            },
            error: function (xhr) {
                if (xhr.status === 401) {
                    window.location.href = 'login.html';
                }
            }
        });

        // Khởi tạo biểu đồ Doanh thu và Khách hàng (Chart.js)
        const chartCanvas = document.getElementById('revenueChart');
        let revenueChartInstance = null;

        function loadChartData(filter = '7_days') {
            if (chartCanvas && typeof Chart !== 'undefined') {
                $.ajax({
                    url: API_BASE + '/dashboard/get_chart_data.php?filter=' + filter,
                    type: 'GET',
                    dataType: 'json',
                    success: function (res) {
                        if (res.success) {
                            if (revenueChartInstance) {
                                revenueChartInstance.destroy();
                            }
                            revenueChartInstance = new Chart(chartCanvas, {
                                type: 'line',
                                data: {
                                    labels: res.data.labels,
                                    datasets: [
                                        {
                                            label: 'Doanh thu (VNĐ)',
                                            data: res.data.revenue_values,
                                            borderColor: '#0F172A',
                                            backgroundColor: 'rgba(15, 23, 42, 0.1)',
                                            borderWidth: 2,
                                            pointBackgroundColor: '#0F172A',
                                            pointBorderColor: '#fff',
                                            pointRadius: 4,
                                            pointHoverRadius: 6,
                                            fill: true,
                                            tension: 0.4,
                                            yAxisID: 'y'
                                        },
                                        {
                                            label: 'Khách hàng mới',
                                            data: res.data.customer_values,
                                            borderColor: '#059669', // Emerald
                                            backgroundColor: 'transparent',
                                            borderWidth: 2,
                                            borderDash: [5, 5],
                                            pointBackgroundColor: '#059669',
                                            pointBorderColor: '#fff',
                                            pointRadius: 4,
                                            pointHoverRadius: 6,
                                            fill: false,
                                            tension: 0.4,
                                            yAxisID: 'y1'
                                        }
                                    ]
                                },
                                options: {
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: true, position: 'top' },
                                        tooltip: {
                                            callbacks: {
                                                label: function (context) {
                                                    if (context.dataset.yAxisID === 'y') {
                                                        return context.dataset.label + ': ' + formatVND(context.raw);
                                                    }
                                                    return context.dataset.label + ': ' + context.raw;
                                                }
                                            }
                                        }
                                    },
                                    scales: {
                                        y: {
                                            type: 'linear',
                                            display: true,
                                            position: 'left',
                                            beginAtZero: true,
                                            ticks: {
                                                callback: function (value) {
                                                    if (value >= 1000000) return (value / 1000000) + ' Tr';
                                                    if (value >= 1000) return (value / 1000) + ' K';
                                                    return value;
                                                }
                                            }
                                        },
                                        y1: {
                                            type: 'linear',
                                            display: true,
                                            position: 'right',
                                            beginAtZero: true,
                                            grid: { drawOnChartArea: false }, // hide grid lines for secondary axis
                                            ticks: { precision: 0 }
                                        }
                                    }
                                }
                            });
                        }
                    },
                    error: function (xhr, status, error) {
                        console.error("Lỗi khi tải dữ liệu biểu đồ:", status, error);
                        console.error(xhr.responseText);
                    }
                });
            }
        }

        // Tải dữ liệu biểu đồ lần đầu tiên
        loadChartData();

        // Lắng nghe sự kiện khi thay đổi bộ lọc thời gian của biểu đồ
        $('#chartFilter').on('change', function () {
            const filterValue = $(this).val();
            let titleText = 'Biểu đồ doanh thu 7 ngày qua';
            if (filterValue === '1_month') titleText = 'Biểu đồ doanh thu 1 tháng qua';
            else if (filterValue === '1_year') titleText = 'Biểu đồ doanh thu 1 năm qua';
            $('#chartTitle').text(titleText);

            loadChartData(filterValue);
        });
    }

    // ============================================================
    // admin-dashboard.html: Tải danh sách Khách hàng giá trị cao (Top Customers Table)
    // ============================================================
    if ($('#topCustomersBody').length) {
        $.ajax({
            url: API_BASE + '/dashboard/get_top_customers.php?limit=5',
            type: 'GET',
            dataType: 'json',
            success: function (res) {
                if (res.success && res.data.length > 0) {
                    let html = '';
                    const bgColors = [
                        'bg-primary-fixed text-primary-fixed-dim',
                        'bg-secondary-fixed text-secondary-fixed-dim',
                        'bg-tertiary-fixed text-tertiary-fixed-dim',
                        'bg-primary-fixed text-primary-fixed-dim',
                        'bg-secondary-fixed text-secondary-fixed-dim',
                    ];
                    res.data.forEach(function (c, i) {
                        const colorClass = bgColors[i % bgColors.length];
                        html += `
                        <tr class="hover:bg-surface-container-low transition-colors group">
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-full ${colorClass} flex items-center justify-center font-h3 font-bold">
                                        ${getInitial(c.full_name)}
                                    </div>
                                    <div>
                                        <div class="font-label-md text-label-md text-on-surface">${escapeHTML(c.full_name)}</div>
                                        <div class="font-body-sm text-body-sm text-on-surface-variant">${escapeHTML(c.email)}</div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 font-data-mono text-data-mono text-on-surface text-right">${formatVND(c.total_spent)}</td>
                            <td class="px-6 py-4 font-body-sm text-body-sm text-on-surface-variant">${formatDate(c.last_purchase)}</td>
                            <td class="px-6 py-4">
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-[#D1FAE5] text-[#065F46]">
                                    Hoàn thành
                                </span>
                            </td>
                            <td class="px-6 py-4 text-right">
                                <button class="p-1.5 text-secondary hover:bg-surface-variant rounded-DEFAULT transition-colors opacity-0 group-hover:opacity-100">
                                    <span class="material-symbols-outlined text-sm">more_vert</span>
                                </button>
                            </td>
                        </tr>`;
                    });
                    $('#topCustomersBody').html(html);
                }
            }
        });
    }

    // ============================================================
    // index.html: Tải bảng xếp hạng VIP (VIP Leaderboard Cards)
    // ============================================================
    if ($('#vipGrid').length) {
        $.ajax({
            url: API_BASE + '/dashboard/get_top_customers.php?limit=6',
            type: 'GET',
            dataType: 'json',
            success: function (res) {
                if (res.success && res.data.length > 0) {
                    let html = '';
                    const gradients = [
                        'from-yellow-400 to-yellow-600',
                        'from-gray-300 to-gray-500',
                        'from-amber-700 to-amber-900',
                        '', '', ''
                    ];
                    res.data.forEach(function (c, i) {
                        const rank = i + 1;
                        const gradient = gradients[i] || '';
                        const topBar = gradient
                            ? `<div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradient}"></div>`
                            : '';
                        const badge = rank <= 3
                            ? `<div class="absolute -bottom-1 -right-1 bg-surface-container-lowest rounded-full p-0.5">
                                    <span class="material-symbols-outlined text-yellow-500 text-sm" style="font-variation-settings: 'FILL' 1;">workspace_premium</span>
                               </div>`
                            : '';
                        const avatarUrl = c.avatar_url || '';
                        const avatarContent = avatarUrl
                            ? `<img alt="Profile" class="w-full h-full object-cover" src="${avatarUrl}"/>`
                            : `<span class="text-h3 font-h3 text-on-surface-variant">${getInitial(c.full_name)}</span>`;
                        const borderClass = rank <= 3 ? 'border-2' : 'border';
                        const spentColor = rank <= 3 ? 'text-primary font-bold' : 'text-on-surface';

                        html += `
                        <div class="bg-surface-container-lowest border border-surface-variant rounded-xl p-6 shadow-sm hover:bg-surface-container-low transition-colors relative overflow-hidden group">
                            ${topBar}
                            <div class="flex items-start justify-between mb-4">
                                <div class="flex items-center gap-4">
                                    <div class="w-16 h-16 rounded-full overflow-hidden ${borderClass} border-surface-variant flex-shrink-0 relative flex items-center justify-center bg-surface-dim">
                                        ${avatarContent}
                                        ${badge}
                                    </div>
                                    <div>
                                        <h3 class="text-h3 font-h3 text-on-surface line-clamp-1">${escapeHTML(c.full_name)}</h3>
                                        <p class="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Hạng #${rank}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-surface-variant">
                                <div>
                                    <p class="text-label-sm font-label-sm text-on-surface-variant mb-1">Tổng Đơn Hàng</p>
                                    <p class="text-data-mono font-data-mono text-on-surface">${new Intl.NumberFormat('vi-VN').format(c.total_orders)}</p>
                                </div>
                                <div class="text-right">
                                    <p class="text-label-sm font-label-sm text-on-surface-variant mb-1">Tổng Chi Tiêu</p>
                                    <p class="text-data-mono font-data-mono ${spentColor}">${formatVND(c.total_spent)}</p>
                                </div>
                            </div>
                        </div>`;
                    });
                    $('#vipGrid').html(html);
                }
            }
        });
    }
});
