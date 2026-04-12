Page({
  data: {
    selectedRole: '' as 'student' | 'parent' | '',
    phone: '',
    code: '',
    countdown: 0,
    agreed: false,
  },

  onLoad() {
    // 检查是否已登录
    const userRole = wx.getStorageSync('user_role');
    const userId = wx.getStorageSync('user_id');
    
    if (userRole && userId) {
      // 已登录，直接跳转
      this.navigateToHome(userRole);
    }
  },

  // 选择身份
  onSelectRole(e: any) {
    const role = e.currentTarget.dataset.role;
    this.setData({ selectedRole: role });
  },

  // 切换身份
  onSwitchRole() {
    this.setData({ selectedRole: '' });
  },

  // 手机号输入
  onPhoneInput(e: any) {
    this.setData({ phone: e.detail.value });
  },

  // 验证码输入
  onCodeInput(e: any) {
    this.setData({ code: e.detail.value });
  },

  // 发送验证码
  onSendCode() {
    const { phone, countdown } = this.data;
    
    if (countdown > 0) return;
    
    if (!phone || phone.length !== 11) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }

    // 模拟发送验证码
    wx.showToast({ title: '验证码已发送', icon: 'success' });
    
    // 开始倒计时
    this.setData({ countdown: 60 });
    const timer = setInterval(() => {
      const newCountdown = this.data.countdown - 1;
      if (newCountdown <= 0) {
        clearInterval(timer);
      }
      this.setData({ countdown: newCountdown });
    }, 1000);
  },

  // 微信登录
  onWechatLogin() {
    const { selectedRole, agreed } = this.data;

    if (!agreed) {
      wx.showToast({ title: '请先同意用户协议', icon: 'none' });
      return;
    }

    // 开发阶段：直接模拟登录成功
    this.mockLogin(selectedRole);
  },

  // 手机号登录
  onPhoneLogin() {
    const { phone, code, selectedRole, agreed } = this.data;

    if (!agreed) {
      wx.showToast({ title: '请先同意用户协议', icon: 'none' });
      return;
    }

    if (!phone || phone.length !== 11) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }

    if (!code || code.length !== 6) {
      wx.showToast({ title: '请输入6位验证码', icon: 'none' });
      return;
    }

    // 开发阶段：直接模拟登录成功
    this.mockLogin(selectedRole);
  },

  // 处理登录成功
  handleLoginSuccess(result: any, role: string) {
    // 保存登录信息
    wx.setStorageSync('user_id', result.data.user_id);
    wx.setStorageSync('user_role', role);
    wx.setStorageSync('user_name', result.data.name);
    wx.setStorageSync('user_phone', result.data.phone);
    
    wx.showToast({ title: '登录成功', icon: 'success' });
    
    // 跳转到对应首页
    setTimeout(() => {
      this.navigateToHome(role);
    }, 500);
  },

  // 模拟登录（开发阶段使用）
  mockLogin(role: string) {
    const mockUserId = role === 'student' ? 'student_001' : 'parent_001';
    const mockName = role === 'student' ? '学生用户' : '家长用户';

    wx.setStorageSync('user_id', mockUserId);
    wx.setStorageSync('user_role', role);
    wx.setStorageSync('user_name', mockName);
    wx.setStorageSync('user_phone', this.data.phone || '13800138000');

    wx.showToast({
      title: '登录成功',
      icon: 'success',
      success: () => {
        setTimeout(() => {
          this.navigateToHome(role);
        }, 1000);
      }
    });
  },

  // 跳转到首页
  navigateToHome(role: string) {
    if (role === 'student') {
      wx.switchTab({
        url: '/pages/student/assessment/assessment',
        fail: () => {
          wx.redirectTo({ url: '/pages/student/assessment/assessment' });
        }
      });
    } else {
      wx.navigateTo({
        url: '/pages/parent/home/home',
        fail: () => {
          wx.showToast({ title: '跳转失败', icon: 'none' });
        }
      });
    }
  },

  // 切换协议同意状态
  onToggleAgree() {
    this.setData({ agreed: !this.data.agreed });
  },

  // 查看用户协议
  onViewAgreement() {
    wx.showModal({
      title: '用户协议',
      content: '这里是用户协议内容...',
      showCancel: false,
    });
  },

  // 查看隐私政策
  onViewPrivacy() {
    wx.showModal({
      title: '隐私政策',
      content: '这里是隐私政策内容...',
      showCancel: false,
    });
  },
});
