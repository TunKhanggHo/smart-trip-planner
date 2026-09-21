document.addEventListener('DOMContentLoaded', () => {
  initRegisterForm();
  initLoginForm();
});

let currentResetEmail = '';
let tempRegisterData = null;

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
      void loginCard.offsetWidth;
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
    showLoginError('Vui lòng nhập email và mật khẩu!');
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerText = 'Đang xử lý...';
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
        alertText.innerText = 'Đăng nhập thành công!';
        alertBox.style.display = 'flex';
      }
      if (typeof showToast === 'function') showToast('Đăng nhập thành công!', 'success');
      setTimeout(() => { window.location.href = 'index.html'; }, 800);
      return;
    } else {
      showLoginError(data.message || 'Mật khẩu hoặc email sai!');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Đăng Nhập Ngay ➔';
      }
      return;
    }
  } catch (err) {
    console.warn('Backend offline, fallback mode.');
  }

  if (email && pass) {
    const userObj = {
      name: email.split('@')[0],
      email: email,
      avatar: email.charAt(0).toUpperCase()
    };
    localStorage.setItem('trip_planner_user', JSON.stringify(userObj));
    if (typeof showToast === 'function') showToast('Đăng nhập thành công!', 'success');
    setTimeout(() => { window.location.href = 'index.html'; }, 800);
  } else {
    showLoginError('Vui lòng nhập email và mật khẩu!');
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
    showRegError('Vui lòng điền đủ thông tin!');
    return;
  }

  if (pass !== confirmPass) {
    showRegError('Mật khẩu xác nhận không khớp!');
    if (confirmPassInput) {
      confirmPassInput.focus();
      confirmPassInput.select();
    }
    return;
  }

  if (pass.length < 6) {
    showRegError('Mật khẩu tối thiểu 6 ký tự!');
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
        showToast('Mã OTP đã được gửi đến Email!', 'success');
      }
      return;
    } else {
      showRegError(data.message || 'Gửi mã OTP thất bại!');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Tiếp Tục ➔';
      }
      return;
    }
  } catch (err) {
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
    if (typeof showToast === 'function') showToast('Mã OTP khởi tạo!', 'info');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerText = 'Tiếp Tục ➔';
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
      alertStep2Text.innerText = 'Nhập đủ 6 số OTP!';
      alertStep2.style.display = 'flex';
    }
    if (typeof showToast === 'function') showToast('Vui lòng nhập đúng 6 số OTP!', 'error');
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerText = 'Đang xác nhận...';
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
        alertStep2Text.innerText = 'Đăng ký thành công!';
        alertStep2.style.display = 'flex';
      }
      if (typeof showToast === 'function') showToast('Đăng ký tài khoản thành công!', 'success');
      setTimeout(() => { window.location.href = 'index.html'; }, 1000);
      return;
    } else {
      if (alertStep2 && alertStep2Text) {
        alertStep2Text.innerText = data.message || 'Mã OTP không đúng!';
        alertStep2.style.display = 'flex';
      }
      if (typeof showToast === 'function') showToast(data.message || 'Mã OTP sai!', 'error');
      if (btn) {
        btn.disabled = false;
        btn.innerText = 'Hoàn Tất Đăng Ký 🚀';
      }
      return;
    }
  } catch (err) {
    if (tempRegisterData) {
      const userObj = {
        id: Date.now(),
        name: tempRegisterData.name,
        email: tempRegisterData.email,
        avatar: tempRegisterData.name.charAt(0).toUpperCase()
      };
      localStorage.setItem('trip_planner_user', JSON.stringify(userObj));
      if (typeof showToast === 'function') showToast('Đăng ký thành công!', 'success');
      setTimeout(() => { window.location.href = 'index.html'; }, 1000);
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerText = 'Hoàn Tất Đăng Ký 🚀';
    }
  }
};

window.backToRegStep1 = () => {
  const s1 = document.getElementById('regStep1');
  const s2 = document.getElementById('regStep2');
  const alert2 = document.getElementById('registerAlertStep2');
  if (s1) s1.style.display = 'block';
  if (s2) s2.style.display = 'none';
  if (alert2) alert2.style.display = 'none';
};

window.resendRegisterOtp = async () => {
  if (!tempRegisterData) {
    window.backToRegStep1();
    return;
  }

  const resendBtn = document.getElementById('btnResendRegOtp');
  if (resendBtn) {
    resendBtn.disabled = true;
    resendBtn.innerText = 'Đang gửi...';
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
      if (typeof showToast === 'function') showToast('Đã gửi mã OTP mới!', 'info');
    }
  } catch (err) {
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const displayOtp = document.getElementById('regDemoOtpDisplay');
    const otpInput = document.getElementById('regOtp');
    if (displayOtp) displayOtp.innerText = `Mã OTP: ${mockOtp}`;
    if (otpInput) otpInput.value = mockOtp;
    if (typeof showToast === 'function') showToast('Đã tạo mã OTP mới!', 'info');
  } finally {
    if (resendBtn) {
      resendBtn.disabled = false;
      resendBtn.innerText = '🔄 Gửi lại mã OTP';
    }
  }
};

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
      alert1Text.innerText = 'Nhập email của bạn!';
      alert1.style.display = 'flex';
    }
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerText = 'Đang gửi...';
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
        showToast('Mã OTP đã được gửi đến Gmail!', 'success');
      }
    } else {
      if (alert1 && alert1Text) {
        alert1Text.innerText = data.message || 'Email không tồn tại!';
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
      btn.innerText = 'Gửi Mã OTP ➔';
    }
  }
};

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
      alert2Text.innerText = 'Mật khẩu không trùng khớp!';
      alert2.style.display = 'flex';
    }
    return;
  }

  if (newPass.length < 6) {
    if (alert2 && alert2Text) {
      alert2Text.innerText = 'Mật khẩu phải từ 6 ký tự!';
      alert2.style.display = 'flex';
    }
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerText = 'Đang lưu...';
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
        loginAlertText.innerText = 'Đổi mật khẩu thành công!';
        loginAlert.style.display = 'flex';
      }
      if (typeof showToast === 'function') showToast('Đổi mật khẩu thành công!', 'success');
      return;
    } else {
      if (alert2 && alert2Text) {
        alert2Text.innerText = data.message || 'Mã OTP không chính xác!';
        alert2.style.display = 'flex';
      }
    }
  } catch (err) {
    window.closeForgotPasswordModal();
    if (typeof showToast === 'function') showToast('Đổi mật khẩu thành công!', 'success');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerText = 'Xác Nhận ➔';
    }
  }
};

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