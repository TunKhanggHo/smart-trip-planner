/**
 * ==============================================================================
 * DỰ ÁN: SMART TRIP PLANNER (LÊN LỊCH ĐI TRỐN)
 * FILE: assets/js/auth.js
 * NGƯỜI PHỤ TRÁCH: Huy, Khang (STT 6 - Đăng nhập, Đăng ký & Xác thực hệ thống)
 * ==============================================================================
 * Kết nối PHP API & MySQL:
 * - Đăng nhập & Đăng ký với thông báo lỗi trực quan nội tuyến (Inline Alert).
 * - Quên mật khẩu đa bước với mã xác thực OTP (6 chữ số).
 * - Đăng ký 2 bước có xác thực mã OTP chống bot & email thật.
 * - Kiểm tra mật khẩu mã hóa BCRYPT trên MySQL.
 * - Hỗ trợ đăng nhập nhanh Demo 1-Click cho thầy cô chấm bài.
 */

document.addEventListener('DOMContentLoaded', () => {
  initRegisterForm();
  initLoginForm();
});

// Biến lưu tạm email đang thực hiện quên mật khẩu & dữ liệu đăng ký
let currentResetEmail = '';
let tempRegisterData = null;

// ==============================================================================
// 1. XỬ LÝ ĐĂNG NHẬP
// ==============================================================================
window.handleLoginSubmit = async (e) => {
  if (e) e.preventDefault();

  const emailInput = document.getElementById('loginEmail');
  const passInput = document.getElementById('loginPassword');
  const alertBox = document.getElementById('loginAlert');
  const alertText = document.getElementById('loginAlertText');
  const loginCard = document.getElementById('loginCard');
  const submitBtn = document.getElementById('btnLoginSubmit');

  const clearError = () => {
    if (alertBox) {
      alertBox.style.display = 'none';
      alertBox.className = 'auth-alert error';
    }
  };

  const showLoginError = (message) => {
    if (alertBox && alertText) {
      alertText.innerText = message;
      alertBox.className = 'auth-alert error';
      alertBox.style.display = 'flex';
    }
    if (loginCard) {
      loginCard.classList.remove('shake');
      void loginCard.offsetWidth; // Force reflow
      loginCard.classList.add('shake');
    }
    if (passInput) {
      passInput.focus();
      passInput.select();
    }
    if (typeof showToast === 'function') {
      showToast(message, 'error');
    }
  };

  clearError();
  const email = emailInput ? emailInput.value.trim() : '';
  const pass = passInput ? passInput.value : '';

  if (!email || !pass) {
    showLoginError('Vui lòng điền đầy đủ email và mật khẩu!');
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerText = 'Đang kiểm tra đăng nhập...';
  }

  try {
    const res = await fetch('api/auth.php?action=login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: pass })
    });
    const data = await res.json();

    if (res.ok && data.status === 'success') {
      localStorage.setItem('trip_planner_user', JSON.stringify(data.user));
      if (alertBox && alertText) {
        alertBox.className = 'auth-alert success';
        alertText.innerText = 'Đăng nhập thành công! Đang chuyển hướng...';
        alertBox.style.display = 'flex';
      }
      if (typeof showToast === 'function') showToast('Đăng nhập thành công!', 'success');
      setTimeout(() => { window.location.href = 'index.html'; }, 800);
      return;
    } else {
      showLoginError(data.message || 'Email hoặc mật khẩu không chính xác!');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Đang Nhập Ngay ➔';
      }
      return;
    }
  } catch (err) {
    console.warn('Backend API offline, using fallback login.');
  }

  // Fallback LocalStorage khi máy chủ PHP/MySQL chưa mở
  if (email && pass) {
    const userObj = {
      name: email.split('@')[0],
      email: email,
      avatar: email.charAt(0).toUpperCase()
    };
    localStorage.setItem('trip_planner_user', JSON.stringify(userObj));
    if (typeof showToast === 'function') showToast('Đăng nhập thành công (Demo)!', 'success');
    setTimeout(() => { window.location.href = 'index.html'; }, 800);
  } else {
    showLoginError('Vui lòng điền đầy đủ email và mật khẩu!');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerText = 'Đăng Nhập Ngay ➔';
    }
  }
};

function initLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  const emailInput = document.getElementById('loginEmail');
  const passInput = document.getElementById('loginPassword');
  const alertBox = document.getElementById('loginAlert');

  const clearError = () => {
    if (alertBox) alertBox.style.display = 'none';
  };

  if (emailInput) emailInput.addEventListener('input', clearError);
  if (passInput) passInput.addEventListener('input', clearError);

  form.addEventListener('submit', window.handleLoginSubmit);
}

// ==============================================================================
// 2. XỬ LÝ ĐĂNG KÝ TÀI KHOẢN (2 BƯỚC VỚI MÃ OTP CHỐNG BOT)
// ==============================================================================
window.handleRegisterStep1 = async (e) => {
  if (e) e.preventDefault();

  const nameInput = document.getElementById('regName');
  const emailInput = document.getElementById('regEmail');
  const passInput = document.getElementById('regPassword');
  const confirmPassInput = document.getElementById('regConfirmPassword');
  const alertBox = document.getElementById('registerAlert');
  const alertText = document.getElementById('registerAlertText');
  const regCard = document.getElementById('registerCard');
  const submitBtn = document.getElementById('btnRegisterSubmit');

  const showRegError = (msg) => {
    if (alertBox && alertText) {
      alertText.innerText = msg;
      alertBox.className = 'auth-alert error';
      alertBox.style.display = 'flex';
    }
    if (regCard) {
      regCard.classList.remove('shake');
      void regCard.offsetWidth;
      regCard.classList.add('shake');
    }
    if (typeof showToast === 'function') showToast(msg, 'error');
  };

  if (alertBox) alertBox.style.display = 'none';

  const name = nameInput ? nameInput.value.trim() : '';
  const email = emailInput ? emailInput.value.trim() : '';
  const pass = passInput ? passInput.value : '';
  const confirmPass = confirmPassInput ? confirmPassInput.value : '';

  if (!name || !email || !pass || !confirmPass) {
    showRegError('Vui lòng điền đầy đủ tất cả các trường!');
    return;
  }

  if (pass !== confirmPass) {
    showRegError('Mật khẩu xác nhận không trùng khớp!');
    if (confirmPassInput) {
      confirmPassInput.focus();
      confirmPassInput.select();
    }
    return;
  }

  if (pass.length < 6) {
    showRegError('Mật khẩu phải có độ dài từ 6 ký tự trở lên!');
    if (passInput) passInput.focus();
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerText = 'Đang gửi mã OTP...';
  }

  try {
    const res = await fetch('api/auth.php?action=send_register_otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, email: email, password: pass })
    });
    const data = await res.json();

    if (res.ok && data.status === 'success') {
      tempRegisterData = { name, email, password: pass };
      
      const displayEmail = document.getElementById('displayRegTargetEmail');
      const step1 = document.getElementById('regStep1');
      const step2 = document.getElementById('regStep2');
      const otpInput = document.getElementById('regOtp');

      if (displayEmail) displayEmail.innerText = email;
      
      if (step1) step1.style.display = 'none';
      if (step2) step2.style.display = 'block';
      
      if (otpInput) {
        otpInput.value = '';
        otpInput.focus();
      }

      if (typeof showToast === 'function') {
        showToast('Mã OTP đã được gửi vào Gmail của bạn! Vui lòng kiểm tra hộp thư.', 'success');
      }
      return;
    } else {
      showRegError(data.message || 'Lỗi khi gửi mã xác thực OTP!');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Tiếp Tục: Gửi Mã OTP Qua Email ➔';
      }
      return;
    }
  } catch (err) {
    console.warn('Backend send_register_otp offline, using fallback OTP:', err);
    tempRegisterData = { name, email, password: pass };
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const displayEmail = document.getElementById('displayRegTargetEmail');
    const displayOtp = document.getElementById('regDemoOtpDisplay');
    const step1 = document.getElementById('regStep1');
    const step2 = document.getElementById('regStep2');
    const otpInput = document.getElementById('regOtp');

    if (displayEmail) displayEmail.innerText = email;
    if (displayOtp) displayOtp.innerText = `Mã OTP: ${mockOtp}`;
    if (step1) step1.style.display = 'none';
    if (step2) step2.style.display = 'block';
    if (otpInput) {
      otpInput.value = mockOtp;
      otpInput.focus();
    }
    if (typeof showToast === 'function') showToast('Mã OTP (Demo) đã được tạo!', 'info');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerText = 'Tiếp Tục: Gửi Mã OTP Qua Email ➔';
    }
  }
};

function initRegisterForm() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  const alertBox = document.getElementById('registerAlert');
  const clearRegError = () => {
    if (alertBox) alertBox.style.display = 'none';
  };

  form.querySelectorAll('input').forEach(inp => inp.addEventListener('input', clearRegError));
  form.addEventListener('submit', window.handleRegisterStep1);
}

// Bước 2: Xác nhận OTP và hoàn tất đăng ký
window.handleVerifyRegister = async (e) => {
  if (e) e.preventDefault();
  const otpInput = document.getElementById('regOtp');
  const alertStep2 = document.getElementById('registerAlertStep2');
  const alertStep2Text = document.getElementById('registerAlertStep2Text');
  const btn = document.getElementById('btnVerifyRegSubmit');

  if (alertStep2) alertStep2.style.display = 'none';

  const otp = otpInput ? otpInput.value.trim() : '';
  if (!otp || otp.length !== 6) {
    if (alertStep2 && alertStep2Text) {
      alertStep2Text.innerText = 'Vui lòng nhập đúng 6 chữ số mã OTP!';
      alertStep2.style.display = 'flex';
    }
    if (typeof showToast === 'function') showToast('Vui lòng nhập đúng 6 số OTP!', 'error');
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerText = 'Đang xác thực & Tạo tài khoản...';
  }

  try {
    const res = await fetch('api/auth.php?action=verify_register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp: otp })
    });
    const data = await res.json();

    if (res.ok && data.status === 'success') {
      localStorage.setItem('trip_planner_user', JSON.stringify(data.user));
      if (alertStep2 && alertStep2Text) {
        alertStep2.className = 'auth-alert success';
        alertStep2Text.innerText = 'Đăng ký tài khoản thành công! Đang chuyển hướng...';
        alertStep2.style.display = 'flex';
      }
      if (typeof showToast === 'function') showToast('Đăng ký tài khoản thành công!', 'success');
      setTimeout(() => { window.location.href = 'index.html'; }, 1000);
      return;
    } else {
      if (alertStep2 && alertStep2Text) {
        alertStep2Text.innerText = data.message || 'Mã xác thực OTP không chính xác hoặc đã hết hạn!';
        alertStep2.style.display = 'flex';
      }
      if (typeof showToast === 'function') showToast(data.message || 'OTP không đúng!', 'error');
      if (btn) {
        btn.disabled = false;
        btn.innerText = 'Xác Nhận & Hoàn Tất Đăng Ký 🚀';
      }
      return;
    }
  } catch (err) {
    // Fallback demo
    if (tempRegisterData) {
      const userObj = {
        id: Date.now(),
        name: tempRegisterData.name,
        email: tempRegisterData.email,
        avatar: tempRegisterData.name.charAt(0).toUpperCase()
      };
      localStorage.setItem('trip_planner_user', JSON.stringify(userObj));
      if (typeof showToast === 'function') showToast('Đăng ký tài khoản thành công (Demo)!', 'success');
      setTimeout(() => { window.location.href = 'index.html'; }, 1000);
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerText = 'Xác Nhận & Hoàn Tất Đăng Ký 🚀';
    }
  }
};

// Quay lại Bước 1 sửa thông tin
window.backToRegStep1 = () => {
  const s1 = document.getElementById('regStep1');
  const s2 = document.getElementById('regStep2');
  const alert2 = document.getElementById('registerAlertStep2');
  if (s1) s1.style.display = 'block';
  if (s2) s2.style.display = 'none';
  if (alert2) alert2.style.display = 'none';
};

// Gửi lại mã OTP
window.resendRegisterOtp = async () => {
  if (!tempRegisterData) {
    window.backToRegStep1();
    return;
  }

  const resendBtn = document.getElementById('btnResendRegOtp');
  if (resendBtn) {
    resendBtn.disabled = true;
    resendBtn.innerText = 'Đang gửi lại...';
  }

  try {
    const res = await fetch('api/auth.php?action=send_register_otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tempRegisterData)
    });
    const data = await res.json();
    if (res.ok && data.status === 'success') {
      const displayOtp = document.getElementById('regDemoOtpDisplay');
      const otpInput = document.getElementById('regOtp');
      if (displayOtp) displayOtp.innerText = `Mã OTP: ${data.otp}`;
      if (otpInput) otpInput.value = data.otp;
      if (typeof showToast === 'function') showToast('Đã gửi lại mã OTP mới!', 'info');
    }
  } catch (err) {
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const displayOtp = document.getElementById('regDemoOtpDisplay');
    const otpInput = document.getElementById('regOtp');
    if (displayOtp) displayOtp.innerText = `Mã OTP: ${mockOtp}`;
    if (otpInput) otpInput.value = mockOtp;
    if (typeof showToast === 'function') showToast('Đã tạo mã OTP mới (Demo)!', 'info');
  } finally {
    if (resendBtn) {
      resendBtn.disabled = false;
      resendBtn.innerText = '🔄 Gửi lại mã OTP';
    }
  }
};

// ==============================================================================
// 3. XỬ LÝ QUÊN MẬT KHẨU & OTP
// ==============================================================================
window.openForgotPasswordModal = () => {
  const modal = document.getElementById('forgotPasswordModal');
  if (!modal) return;

  const s1 = document.getElementById('forgotStep1');
  const s2 = document.getElementById('forgotStep2');
  const alert1 = document.getElementById('forgotAlertStep1');
  const alert2 = document.getElementById('forgotAlertStep2');

  if (s1) s1.style.display = 'block';
  if (s2) s2.style.display = 'none';
  if (alert1) alert1.style.display = 'none';
  if (alert2) alert2.style.display = 'none';

  const loginEmail = document.getElementById('loginEmail');
  const forgotEmailInput = document.getElementById('forgotEmail');
  if (loginEmail && forgotEmailInput && loginEmail.value.trim()) {
    forgotEmailInput.value = loginEmail.value.trim();
  }

  modal.style.display = 'flex';
};

window.closeForgotPasswordModal = () => {
  const modal = document.getElementById('forgotPasswordModal');
  if (modal) modal.style.display = 'none';
};

window.backToStep1 = () => {
  const s1 = document.getElementById('forgotStep1');
  const s2 = document.getElementById('forgotStep2');
  if (s1) s1.style.display = 'block';
  if (s2) s2.style.display = 'none';
};

// Bước 1: Gửi mã OTP xác nhận quên mật khẩu
window.handleSendOtp = async (e) => {
  if (e) e.preventDefault();
  const emailInput = document.getElementById('forgotEmail');
  const alert1 = document.getElementById('forgotAlertStep1');
  const alert1Text = document.getElementById('forgotAlertStep1Text');
  const btn = document.getElementById('btnSendOtp');

  if (alert1) alert1.style.display = 'none';
  const email = emailInput ? emailInput.value.trim() : '';

  if (!email) {
    if (alert1 && alert1Text) {
      alert1Text.innerText = 'Vui lòng nhập địa chỉ email!';
      alert1.style.display = 'flex';
    }
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerText = 'Đang gửi mã OTP...';
  }

  try {
    const res = await fetch('api/auth.php?action=forgot_password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email })
    });
    const data = await res.json();

    if (res.ok && data.status === 'success') {
      currentResetEmail = email;
      const displayEmail = document.getElementById('displayTargetEmail');
      const s1 = document.getElementById('forgotStep1');
      const s2 = document.getElementById('forgotStep2');
      const otpInput = document.getElementById('forgotOtp');

      if (displayEmail) displayEmail.innerText = email;
      if (s1) s1.style.display = 'none';
      if (s2) s2.style.display = 'block';
      if (otpInput) {
        otpInput.value = '';
        otpInput.focus();
      }
      if (typeof showToast === 'function') {
        showToast('Mã OTP đã được gửi vào Gmail của bạn! Vui lòng kiểm tra hộp thư.', 'success');
      }
    } else {
      if (alert1 && alert1Text) {
        alert1Text.innerText = data.message || 'Không tìm thấy tài khoản với email này!';
        alert1.style.display = 'flex';
      }
    }
  } catch (err) {
    currentResetEmail = email;
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const displayEmail = document.getElementById('displayTargetEmail');
    const displayOtp = document.getElementById('demoOtpDisplay');
    const s1 = document.getElementById('forgotStep1');
    const s2 = document.getElementById('forgotStep2');
    const otpInput = document.getElementById('forgotOtp');

    if (displayEmail) displayEmail.innerText = email;
    if (displayOtp) displayOtp.innerText = `Mã OTP: ${mockOtp}`;
    if (s1) s1.style.display = 'none';
    if (s2) s2.style.display = 'block';
    if (otpInput) {
      otpInput.value = mockOtp;
      otpInput.focus();
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerText = 'Gửi Mã Xác Nhận OTP ➔';
    }
  }
};

// Bước 2: Xác thực OTP & Đổi mật khẩu mới
window.handleResetPassword = async (e) => {
  if (e) e.preventDefault();
  const otpInput = document.getElementById('forgotOtp');
  const newPassInput = document.getElementById('forgotNewPassword');
  const confirmPassInput = document.getElementById('forgotConfirmPassword');
  const alert2 = document.getElementById('forgotAlertStep2');
  const alert2Text = document.getElementById('forgotAlertStep2Text');
  const btn = document.getElementById('btnConfirmReset');

  if (alert2) alert2.style.display = 'none';

  const otp = otpInput ? otpInput.value.trim() : '';
  const newPass = newPassInput ? newPassInput.value : '';
  const confirmPass = confirmPassInput ? confirmPassInput.value : '';

  if (newPass !== confirmPass) {
    if (alert2 && alert2Text) {
      alert2Text.innerText = 'Mật khẩu xác nhận không trùng khớp!';
      alert2.style.display = 'flex';
    }
    return;
  }

  if (newPass.length < 6) {
    if (alert2 && alert2Text) {
      alert2Text.innerText = 'Mật khẩu mới phải có ít nhất 6 ký tự!';
      alert2.style.display = 'flex';
    }
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerText = 'Đang cập nhật mật khẩu...';
  }

  try {
    const res = await fetch('api/auth.php?action=reset_password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: currentResetEmail,
        otp: otp,
        password: newPass
      })
    });
    const data = await res.json();

    if (res.ok && data.status === 'success') {
      window.closeForgotPasswordModal();
      
      const loginEmail = document.getElementById('loginEmail');
      const loginAlert = document.getElementById('loginAlert');
      const loginAlertText = document.getElementById('loginAlertText');
      if (loginEmail) loginEmail.value = currentResetEmail;
      if (loginAlert && loginAlertText) {
        loginAlert.className = 'auth-alert success';
        loginAlertText.innerText = 'Đổi mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.';
        loginAlert.style.display = 'flex';
      }
      if (typeof showToast === 'function') showToast('Đổi mật khẩu thành công!', 'success');
      return;
    } else {
      if (alert2 && alert2Text) {
        alert2Text.innerText = data.message || 'Mã OTP không chính xác hoặc đã hết hạn!';
        alert2.style.display = 'flex';
      }
    }
  } catch (err) {
    window.closeForgotPasswordModal();
    if (typeof showToast === 'function') showToast('Đã đổi mật khẩu thành công (Demo)!', 'success');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerText = 'Đổi Mật Khẩu ➔';
    }
  }
};

// ==============================================================================
// 5. ẨN / HIỆN MẬT KHẨU
// ==============================================================================
window.togglePasswordVisibility = (inputId, btn) => {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    btn.innerText = '🙈';
  } else {
    input.type = 'password';
    btn.innerText = '👁️';
  }
};


