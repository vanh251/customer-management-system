// ============================================================
// Support / Customer Care - jQuery AJAX
// ============================================================
$(document).ready(function () {
    const API_BASE = '../../api';
    let currentTicketId = null;

    function escapeHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function timeAgo(dateStr) {
        if (!dateStr) return '';
        const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
        if (diff < 60) return 'Vừa xong';
        if (diff < 3600) return Math.floor(diff/60) + ' phút trước';
        if (diff < 86400) return Math.floor(diff/3600) + ' giờ trước';
        return Math.floor(diff/86400) + ' ngày trước';
    }
    function formatTime(dateStr) {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleTimeString('en-US', {hour:'2-digit',minute:'2-digit'});
    }
    function getInitial(name) {
        if (!name) return '?';
        const p = name.trim().split(' ');
        return p.length >= 2 ? (p[0][0]+p[p.length-1][0]).toUpperCase() : p[0][0].toUpperCase();
    }

    // ============================================================
    // Load Ticket List (left panel)
    // ============================================================
    function loadTickets() {
        $.ajax({
            url: API_BASE + '/support/get_tickets.php',
            dataType: 'json',
            success: function (res) {
                if (!res.success) return;
                let html = '';
                $('#ticketCount').text(res.total + ' yêu cầu đang mở');
                res.data.forEach(function (t, i) {
                    const isActive = (currentTicketId === t.id) || (!currentTicketId && i === 0);
                    const activeClass = isActive ? 'bg-primary-fixed border-l-primary' : 'bg-surface-container-lowest hover:bg-surface-container border-l-transparent';
                    const avatarImg = t.avatar_url 
                        ? '<img alt="" class="w-full h-full object-cover" src="'+t.avatar_url+'"/>' 
                        : '<span class="font-label-md text-label-md text-on-surface-variant">'+getInitial(t.full_name)+'</span>';
                    const statusBadge = t.status === 'RESOLVED' 
                        ? '<span class="text-xs text-[#065F46] font-semibold">✓</span>' : '';
                    html += '<div class="p-4 border-b border-outline-variant '+activeClass+' cursor-pointer border-l-4 group ticket-item" data-id="'+t.id+'">';
                    html += '<div class="flex justify-between items-start mb-2"><div class="flex items-center gap-3">';
                    html += '<div class="w-10 h-10 rounded-full bg-surface-dim overflow-hidden shrink-0 border border-outline-variant flex items-center justify-center">'+avatarImg+'</div>';
                    html += '<div class="flex flex-col"><span class="font-label-md text-label-md text-on-surface">'+escapeHTML(t.full_name)+'</span>';
                    html += '<span class="font-label-sm text-label-sm text-on-surface-variant">'+escapeHTML(t.subject||'Không có chủ đề')+'</span></div></div>';
                    html += '<span class="font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">'+statusBadge+' '+timeAgo(t.created_at)+'</span></div>';
                    html += '<p class="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 pr-4 leading-relaxed">'+escapeHTML(t.message||'')+'</p></div>';
                });
                $('#ticketList').html(html);
                // Auto-select first ticket if none selected
                if (!currentTicketId && res.data.length > 0) {
                    currentTicketId = res.data[0].id;
                    loadConversation(currentTicketId);
                }
            },
            error: function (x) { if (x.status === 401) window.location.href = 'login.html'; }
        });
    }

    // ============================================================
    // Load Conversation (right panel)
    // ============================================================
    function loadConversation(ticketId) {
        currentTicketId = ticketId;
        $.ajax({
            url: API_BASE + '/support/get_tickets.php?ticket_id=' + ticketId,
            dataType: 'json',
            success: function (res) {
                if (!res.success) return;
                const t = res.data.ticket;
                const replies = res.data.replies;
                // Update header
                const avatarImg = t.avatar_url 
                    ? '<img alt="" class="w-full h-full object-cover" src="'+t.avatar_url+'"/>' 
                    : '<span class="font-label-md">'+getInitial(t.full_name)+'</span>';
                $('#convoHeaderAvatar').html(avatarImg);
                $('#convoHeaderName').text(t.full_name);
                $('#convoHeaderEmail').html('<span class="material-symbols-outlined text-[16px]">mail</span> '+escapeHTML(t.email));
                // Update resolve button
                if (t.status === 'RESOLVED') {
                    $('#resolveBtn').text('Đã giải quyết').prop('disabled', true).addClass('opacity-50');
                } else {
                    $('#resolveBtn').text('Đánh dấu đã giải quyết').prop('disabled', false).removeClass('opacity-50');
                }
                // Build chat
                let chatHtml = '';
                // Date separator
                chatHtml += '<div class="flex items-center justify-center"><span class="px-3 py-1 bg-surface-container rounded-full font-label-sm text-label-sm text-on-surface-variant border border-outline-variant">Hôm nay</span></div>';
                // Main ticket message (customer)
                chatHtml += buildBubble(t, false);
                // Replies
                replies.forEach(function (r) {
                    chatHtml += buildBubble(r, r.is_admin_reply == 1);
                });
                $('#chatCanvas').html(chatHtml);
                // Scroll to bottom
                const canvas = document.getElementById('chatCanvas');
                if (canvas) canvas.scrollTop = canvas.scrollHeight;
                // Highlight active ticket in list
                $('.ticket-item').removeClass('bg-primary-fixed border-l-primary').addClass('bg-surface-container-lowest border-l-transparent');
                $('.ticket-item[data-id="'+ticketId+'"]').removeClass('bg-surface-container-lowest border-l-transparent').addClass('bg-primary-fixed border-l-primary');
                // Update placeholder
                $('#replyMessage').attr('placeholder', 'Nhập câu trả lời cho ' + t.full_name + '...');
            }
        });
    }

    function buildBubble(msg, isAdmin) {
        const avatarImg = msg.avatar_url 
            ? '<img alt="" class="w-full h-full object-cover" src="'+msg.avatar_url+'"/>' 
            : '<span class="font-label-sm">'+getInitial(msg.full_name)+'</span>';
        if (isAdmin) {
            return '<div class="flex gap-4 max-w-[85%] self-end flex-row-reverse">'
                +'<div class="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-1 bg-surface-dim flex items-center justify-center">'+avatarImg+'</div>'
                +'<div class="flex flex-col gap-1 items-end">'
                +'<div class="flex items-center gap-2 mr-1"><span class="font-label-sm text-label-sm text-on-surface-variant">'+formatTime(msg.created_at)+'</span><span class="font-label-sm text-label-sm text-on-surface">Bạn</span></div>'
                +'<div class="bg-primary text-on-primary rounded-xl rounded-tr-sm p-4 shadow-sm"><p class="font-body-base text-body-base leading-relaxed">'+escapeHTML(msg.message)+'</p></div>'
                +'</div></div>';
        } else {
            return '<div class="flex gap-4 max-w-[85%] self-start">'
                +'<div class="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-1 bg-surface-dim flex items-center justify-center">'+avatarImg+'</div>'
                +'<div class="flex flex-col gap-1">'
                +'<div class="flex items-center gap-2 ml-1"><span class="font-label-sm text-label-sm text-on-surface">'+escapeHTML(msg.full_name)+'</span><span class="font-label-sm text-label-sm text-on-surface-variant">'+formatTime(msg.created_at)+'</span></div>'
                +'<div class="bg-surface-container-lowest border border-outline-variant rounded-xl rounded-tl-sm p-4 shadow-sm"><p class="font-body-base text-body-base text-on-surface leading-relaxed">'+escapeHTML(msg.message)+'</p></div>'
                +'</div></div>';
        }
    }

    // ============================================================
    // Click on ticket
    // ============================================================
    $(document).on('click', '.ticket-item', function () {
        loadConversation($(this).data('id'));
    });

    // ============================================================
    // Send Reply
    // ============================================================
    $('#sendReplyBtn').on('click', sendReply);
    $('#replyMessage').on('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); }
    });

    function sendReply() {
        const msg = $('#replyMessage').val().trim();
        if (!msg || !currentTicketId) return;
        $.ajax({
            url: API_BASE + '/support/reply_ticket.php',
            type: 'POST',
            data: { ticket_id: currentTicketId, message: msg },
            dataType: 'json',
            success: function (res) {
                if (res.success) {
                    $('#replyMessage').val('');
                    // Append new bubble without full reload
                    const bubble = buildBubble(res.data, true);
                    $('#chatCanvas').append(bubble);
                    const canvas = document.getElementById('chatCanvas');
                    if (canvas) canvas.scrollTop = canvas.scrollHeight;
                }
            }
        });
    }

    // ============================================================
    // Resolve Ticket
    // ============================================================
    $('#resolveBtn').on('click', function () {
        if (!currentTicketId) return;
        if (!confirm('Bạn có chắc muốn đánh dấu ticket này là đã giải quyết?')) return;
        $.ajax({
            url: API_BASE + '/support/resolve_ticket.php',
            type: 'POST',
            data: { ticket_id: currentTicketId },
            dataType: 'json',
            success: function (res) {
                if (res.success) {
                    $('#resolveBtn').text('Đã giải quyết').prop('disabled', true).addClass('opacity-50');
                    loadTickets();
                }
            }
        });
    });

    // ============================================================
    // Initial Load
    // ============================================================
    loadTickets();
});
