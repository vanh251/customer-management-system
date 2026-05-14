const fs = require('fs');
const path = require('path');
const dir = 'c:\\xampp\\htdocs\\BTL3\\public\\asset';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'login.html');

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace Header User Button Name
  content = content.replace(/<span class=\"([^\"]*)\">Quản trị viên<\/span>/g, '<span class=\"$1 auth-user-name\">Quản trị viên</span>');
  content = content.replace(/<span class=\"([^\"]*)\" id=\"adminName\">Admin<\/span>/g, '<span class=\"$1 auth-user-name\" id=\"adminName\">Admin</span>');
  
  // Replace Profile Popup Name
  content = content.replace(/<p class=\"([^\"]*)\">Quản trị viên<\/p>/g, '<p class=\"$1 auth-user-name\">Quản trị viên</p>');
  
  // Replace Role
  content = content.replace(/Vai trò: Quản trị viên/g, 'Vai trò: <span class=\"auth-user-role\">Quản trị viên</span>');
  
  // Replace Email
  content = content.replace(/<p class=\"([^\"]*)\">admin@commercesuite.com<\/p>/g, '<p class=\"$1 auth-user-email\">admin@commercesuite.com</p>');

  // Avatar Image in Button (for those with images like admin-dashboard)
  content = content.replace(/<img([^>]*)src=\"https:\/\/lh3.googleusercontent.com[^\"]*\"([^>]*)>/g, '<img$1src=\"\" class=\"auth-user-avatar-img hidden\"$2><span class=\"auth-user-avatar-text w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm hidden\"></span>');
  
  // Avatar Image in Popup
  content = content.replace(/<img([^>]*)src=\"https:\/\/lh3.googleusercontent.com[^\"]*\"([^>]*)>/g, '<img$1src=\"\" class=\"auth-user-avatar-img hidden\"$2><span class=\"auth-user-avatar-text w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-lg hidden\"></span>');

  // For those with text avatar like customer-management
  content = content.replace(/<span class=\"([^\"]*)\">QT<\/span>/g, '<span class=\"$1 auth-user-avatar-text\">QT</span><img src=\"\" class=\"auth-user-avatar-img hidden w-full h-full object-cover\" />');
  content = content.replace(/<span class=\"([^\"]*)\" id=\"adminAvatar\">AD<\/span>/g, '<span class=\"$1 auth-user-avatar-text\" id=\"adminAvatar\">AD</span><img src=\"\" class=\"auth-user-avatar-img hidden w-full h-full object-cover\" />');
  
  fs.writeFileSync(filePath, content);
  console.log('Updated ' + file);
});
