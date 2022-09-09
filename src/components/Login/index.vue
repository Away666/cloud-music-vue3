<script setup lang='ts'>
import { reactive, ref, onMounted, nextTick, watch } from "vue";
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { login, isRegister, userInfo, logout, sendCaptcha, register, qrLogin, qrCreate, qrCheck } from '@/api/login/index'
import { useStore } from "vuex";
import qrcode from 'qrcode'
import router from "@/router";

const formRef = ref<FormInstance>()
let timestamp: number = Date.parse(new Date().toString());
let store = useStore()

interface RootObject {
  qrCodeVisible: boolean;
  dialogFormVisible: boolean;
  isShowCaptchaButton: boolean;
  countDown: number;
  isLogin: boolean;
  formVisible: number;
  loginForm: LoginForm;
  forgetPasswordForm: ForgetPasswordForm;
  registerForm: RegisterForm;
  userInfo: UserInfo;
  isArrowSendCaptcha: boolean;
  qrKey: string;
  qrUrl: string;
  showQrCodeMask: boolean;
}

interface UserInfo {
  avatarUrl: string;
  nickname: string;
  userId: string;
}

interface RegisterForm {
  phone: string;
  password: string;
  nickname: string;
  captcha: string;
}

interface ForgetPasswordForm {
  phone: string;
  password: string;
  checkPassword: string;
  captcha: string;
}

interface LoginForm {
  phone: string;
  password: string;
  timestamp: number;
}

const data: RootObject = reactive({
  qrCodeVisible: false,
  dialogFormVisible: false,
  isShowCaptchaButton: true,
  countDown: 60,
  isLogin: false,
  formVisible: 1,
  loginForm: { phone: '', password: '', timestamp: 0 },
  forgetPasswordForm: { phone: '', password: '', checkPassword: '', captcha: '' },
  registerForm: { phone: '', password: '', nickname: '', captcha: '' },
  userInfo: { avatarUrl: '', nickname: '', userId: '' },
  isArrowSendCaptcha: false,
  qrKey: '',
  qrUrl: '',
  showQrCodeMask: false,
})

// 手机号码的校验规则，包含注册和登录
const validatePhone: any = async (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('手机号不能为空'))
  } else {
    if (rule.phone !== '') {
      let reg = /^1[3|4|5|7|8|9][0-9]{9}$/;
      if (!reg.test(value)) {
        callback(new Error('请输入有效的手机号码'))
      } else {
        // 判断该手机号码是否被注册的api
        // isRegister(value).then((res) => {
        //   if (res.data.code == 200) {
        //     // 判断该手机号码是否有密码和是否是注册的表单
        //     if (res.data.hasPassword && data.isRegisterFrom) {
        //       callback(new Error("此号码已被注册"));
        //     }
        //   }
        // })
        let res = await isRegister(value)
        if (res.data.code == 200) {
          if (data.formVisible == 2 && res.data.hasPassword) {
            data.isArrowSendCaptcha = true
          }
          if (data.formVisible == 2 && !res.data.hasPassword) {
            data.isArrowSendCaptcha = false
            callback(new Error("此号码未被注册,您发送不了验证码,请前往注册账号"));
          }
          if (data.formVisible == 3 && !res.data.hasPassword) {
            data.isArrowSendCaptcha = true
          }
          if (res.data.hasPassword && data.formVisible == 3) {
            data.isArrowSendCaptcha = false
            callback(new Error("此号码已被注册,您发送不了验证码,如果是忘记密码请前往修改密码"));
          }
        }
      }
    }
    callback();
  }
}

// 确认密码
const checkPassword: any = async (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'));
  } else if (value !== data.forgetPasswordForm.password) {
    callback(new Error('两次输入密码不一致!'));
  } else {
    callback();
  }
}

// 登录表单校验
const rules = reactive<FormRules>({
  phone: [
    { required: true, validator: validatePhone, trigger: 'change' },
  ],
  password: [
    {
      required: true,
      message: '请输入密码',
      trigger: 'change',
    },
  ]
})

// 忘记密码表单校验
const rulesForgetPassword = reactive<FormRules>({
  phone: [
    { required: true, validator: validatePhone, trigger: 'change' },
  ],
  password: [
    {
      required: true,
      message: '请输入密码',
      trigger: 'change',
    },
  ],
  checkPassword: [{
    required: true,
    validator: checkPassword,
    trigger: 'blur',
  },],
  captcha: [
    {
      required: true,
      message: '请输入验证码',
      trigger: 'change',
    }
  ]
})

// 注册表单校验
const rulesRegister = reactive<FormRules>({
  phone: [
    { required: true, validator: validatePhone, trigger: 'change' },
  ],
  password: [
    {
      required: true,
      message: '请输入密码',
      trigger: 'change',
    },
  ],
  nickname: [{
    required: true,
    message: '请输入昵称',
    trigger: 'change',
  },],
  captcha: [
    {
      required: true,
      message: '请输入验证码',
      trigger: 'change',
    }
  ]
})

// 打开对话框
const open = () => {
  data.isLogin = false
  data.qrCodeVisible = true
  data.dialogFormVisible = false
}

// 登录提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      let loginForm = data.loginForm
      loginForm.timestamp = timestamp
      login(loginForm).then((res) => {
        if (res.data.code == 200) {
          // 将请求到的用户id存入localstorage
          // 在index.vue 和 bottomControl.vue中用到过
          window.localStorage.setItem("userId", res.data.profile.userId);
          data.userInfo = res.data.profile
          data.isLogin = true
          store.dispatch('login/login', true)
          data.dialogFormVisible = false
          formEl.resetFields()
          ElMessage({
            message: '登录成功',
            type: 'success',
          })
        } else if (res.data.code == 501) {
          // 密码错误
          ElMessage({
            message: res.data.msg,
            type: 'warning',
          })
          return;
        } else if (res.data.code == 502) {
          // 密码错误
          ElMessage({
            message: res.data.msg,
            type: 'warning',
          })
          return;
        } else {
          ElMessage({
            message: "登录失败，请重试",
            type: 'warning',
          })
        }
      }).catch((err) => {
        ElMessage({
          message: "手机号或密码错误",
          type: 'warning',
        })
      })
    } else {
      ElMessage({
        message: "您提交的信息不合法",
        type: 'warning',
      })
      return;
    }
  })
}

// 提交注册表单,如果手机号已被注册相当于修改密码
const submitRegisterForm = async (formEl: FormInstance | undefined) => {
  // register(data.registerForm).then((res) => {
  //   if (res.data.code == 200) {
  //     data.isRegisterFrom = false
  //   }
  //   else {
  //     console.log(111);
  //     ElMessage.error(res.response.data.message)
  //   }
  // })
  if (!formEl) return
  await formEl.validate(async (valid: any, fields) => {
    if (valid) {
      let result: any = await register(data.formVisible == 3 ? data.registerForm : data.forgetPasswordForm)
      if (result.response) {
        ElMessage.error(result.response.data.message)
      }
      else if (result.data.code == 200) {
        data.formVisible = 1
        formEl.resetFields()
      }
    } else {
      ElMessage.error("请填写正确德信息")
    }
  })


}

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  clearInterval(timer);
  timer = null
  data.isShowCaptchaButton = true
  data.isArrowSendCaptcha = false
  data.countDown = 60
  if (!formEl) return
  data.dialogFormVisible = false
  formEl.resetFields()
}

// 获取当前用户信息
const getCurrentUserInfo = () => {
  userInfo(timestamp).then((res: any) => {
    if (res.data.profile.userId) {
      data.isLogin = true
      store.dispatch('login/login', true)
      data.userInfo = res.data.profile
      store.dispatch('login/getUserInfo', data.userInfo)
      window.localStorage.setItem("userId", res.data.profile.userId);
    } else {
      data.isLogin = false
      store.dispatch('login/login', false)
      store.dispatch('login/getUserInfo', {})
      if (window.localStorage.getItem("userId")) {
        window.localStorage.removeItem("userId");
      }
    }
  })
}

// 退出登录
const logoutHandle = () => {
  logout('').then((res) => {
    if (res.data.code == 200) {
      window.localStorage.removeItem("userId");
      data.isLogin = false;
      store.dispatch('login/login', false)
      data.userInfo = { avatarUrl: '', nickname: '', userId: '' };
      store.dispatch('login/getCreatedList', [])
      store.dispatch('login/getUserInfo', {})
      ElMessage({
        message: '退出成功',
        type: 'success',
      })
    } else {
      ElMessage({
        message: '退出登录失败，请重试',
        type: 'error',
      })
    }
  })
}

// 去注册
const goRegister = () => {
  clearInterval(timer);
  timer = null
  data.isShowCaptchaButton = true
  data.isArrowSendCaptcha = false
  data.countDown = 60
  data.registerForm = { phone: '', password: '', nickname: '', captcha: '' }
  data.formVisible = 3
}

// 去登录
const goLogin = () => {
  data.loginForm = { phone: '', password: '', timestamp: 0 }
  data.formVisible = 1
}

// 去修改密码
const goUpdatePassword = () => {
  clearInterval(timer);
  timer = null
  data.isShowCaptchaButton = true
  data.isArrowSendCaptcha = false
  data.countDown = 60
  data.forgetPasswordForm = { phone: '', password: '', checkPassword: '', captcha: '' }
  data.formVisible = 2
}

let timer: any = null
// 发送验证码
const sendCaptchaHandle = () => {
  data.isShowCaptchaButton = false
  sendCaptcha(data.formVisible == 3 ? data.registerForm.phone : data.forgetPasswordForm.phone).then((res: any) => {
    if (res.data.code == 400) {
      ElMessage.error(res.data.message || res.data.msg)
    }
  })
  timer = setInterval(() => {
    data.countDown--
  }, 1000)
}

// 生成二维码key
const qrLoginKey = () => {
  clearInterval(timer2)
  qrLogin(timestamp).then((res) => {
    if (res.data.code) {
      data.qrKey = res.data.data.unikey
      qrCreateHandle(data.qrKey)
    }
  })
}

let timer2: any = null

// 二维码生成接口
const qrCreateHandle = (key: any) => {
  qrCreate(key, timestamp).then((res) => {
    if (res.data.code == 200) {
      qrcode.toDataURL(res.data.data.qrurl).then((res: any) => {
        data.qrUrl = res
        qrCodeCheckHandle()
      });
    }
  })
}

// 切换登录模式
const changeLoginMode = () => {
  data.qrCodeVisible = false
  data.formVisible = 1
  data.dialogFormVisible = true
}

// 返回二维码登录
const toQcCode = () => {
  data.dialogFormVisible = false
  data.formVisible = 1
  data.qrCodeVisible = true
}

const qrCodeCheckHandle = () => {
  timer2 = setInterval(() => {
    timestamp = Date.parse(new Date().toString())
    qrCheck(data.qrKey, timestamp).then((res) => {
      //800 为二维码过期,801 为等待扫码,802 为待确认,803 为授权登录成功(803 状态码下会返回 cookies)
      if (res.data.code == 803) {
        getCurrentUserInfo()
        clearInterval(timer2)
        data.qrCodeVisible = false
        ElMessage({
          message: '登录成功',
          type: 'success',
        })
      }
      if (res.data.code == 800) {
        data.showQrCodeMask = true
      }
    })
  }, 700)
}

// 点击关闭按钮，关闭定时器
const closeVisible = () => {
  clearInterval(timer2);
}

// 刷新二维码
const refreshQrCode = () => {
  data.showQrCodeMask = false
  qrLoginKey()
}

const toUserDetail = (id: any) => {
  router.push({ name: 'userdetail', params: { id } })
}

onMounted(() => {
  getCurrentUserInfo()
})

// 监听倒计时
watch(() => data.countDown, (newValue, oldValue) => {
  if (newValue == 0) {
    clearInterval(timer);
    data.isShowCaptchaButton = true;
    data.countDown = 60;
  }
})

watch(() => data.qrCodeVisible, (current) => {
  if (current) {
    qrLoginKey()
  }

})

</script>
<template>
  <div class="login-container">
    <div class="login" v-if="data.isLogin == false">
      <img class="person" src="../../assets/images/person.png" alt="">
      <span @click="open" class="username">请登录 ▼</span>
    </div>
    <div class="login" v-else>
      <img v-lazy="data.userInfo.avatarUrl + '?param=200y200'" alt="" class="person user-avatar"
        @click="toUserDetail(data.userInfo.userId)" />
      <el-popover placement="bottom" width="200" trigger="click" popper-class="popoverBox" :hide-after="0"
        :show-arrow="false">
        <template #reference>
          <div class="username">
            <span>{{ data.userInfo.nickname }} ▼</span>
          </div>
        </template>
        <div class="logout" @click="logoutHandle">退出登录</div>
      </el-popover>
    </div>
    <el-dialog v-model="data.qrCodeVisible" :show-close="true" custom-class="qr-code-dialog" width="500px"
      @close="closeVisible">
      <template #header>
        <div class="my-header">
          <h2 align="center">登录</h2>
        </div>
      </template>
      <div class="qr-code">
        <img class="img" src="@/assets/images/qrcode.png" alt="">
        <span class="item">
          <h3 align="center">扫码登录</h3>
          <div class="qr-code-mask">
            <div class="mask" v-if="data.showQrCodeMask">
              <span>
                <p>二维码已失效</p>
                <button @click="refreshQrCode">点击刷新</button>
              </span>
            </div>
            <img class="qr-img" :src="data.qrUrl" alt="">
          </div>
          <span>使用<a href="#">网易云音乐APP</a>扫码登录</span>
        </span>
      </div>
      <template #footer>
        <span class="qr-code-footer">
          <button @click="changeLoginMode">选择其他登录模式</button>
        </span>
      </template>
    </el-dialog>
    <el-dialog v-model="data.dialogFormVisible" :show-close="false" width="500px">
      <template #header>
        <div class="my-header" v-if="data.formVisible == 1">
          <a href="#" @click="goRegister">未有账号，去注册</a>
          <span>登录</span>
          <a href="#" @click="goUpdatePassword" class="forget-pwd">忘记密码？</a>
        </div>
        <div class="my-header" v-if="data.formVisible == 2">
          <a href="#" @click="goLogin">返回</a>
          <span>忘记密码</span>
        </div>
        <div class="my-header" v-if="data.formVisible == 3">
          <a href="#" @click="goLogin">已有账号，去登录</a>
          <span>注册</span>
        </div>
      </template>
      <!-- 登录表单 -->
      <el-form :rules="rules" :model="data.loginForm" ref="formRef" label-position="right" label-width="80px"
        v-if="data.formVisible == 1" @keyup.enter="submitForm(formRef)">
        <el-form-item label="手机号" prop="phone">
          <el-input v-model.number="data.loginForm.phone" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="data.loginForm.password" type="password" />
        </el-form-item>
      </el-form>
      <!-- 忘记密码 -->
      <el-form :rules="rulesForgetPassword" :model="data.forgetPasswordForm" ref="formRef" label-position="right"
        label-width="80px" v-else-if="data.formVisible == 2">
        <el-form-item label="手机号" prop="phone">
          <el-input v-model.number="data.forgetPasswordForm.phone" />
        </el-form-item>
        <el-form-item label="新密码" prop="password">
          <el-input v-model="data.forgetPasswordForm.password" type="password" />
        </el-form-item>
        <el-form-item label="确认密码" prop="checkPassword">
          <el-input v-model="data.forgetPasswordForm.checkPassword" type="password" />
        </el-form-item>
        <el-form-item label="验证码" prop="captcha">
          <el-input v-model="data.forgetPasswordForm.captcha" :disabled="data.isShowCaptchaButton"
            class="captchaInput" />
          <button class="captchaButton" v-if="data.isShowCaptchaButton && data.isArrowSendCaptcha"
            @click="sendCaptchaHandle">发送验证码</button>
          <button class=" captchaButton buttonDisable" v-else-if="!data.isShowCaptchaButton"
            :disabled="!data.isShowCaptchaButton">
            {{ data.countDown }}S
          </button>
          <button class="captchaButton" v-else @click.prevent="">发送验证码</button>
        </el-form-item>
      </el-form>
      <!-- 注册表单 -->
      <el-form :rules="rulesRegister" :model="data.registerForm" ref="formRef" label-position="right" label-width="80px"
        v-else>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model.number="data.registerForm.phone" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="data.registerForm.password" type="password" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="data.registerForm.nickname" />
        </el-form-item>
        <el-form-item label="验证码" prop="captcha">
          <el-input v-model="data.registerForm.captcha" :disabled="data.isShowCaptchaButton" class="captchaInput" />
          <button class="captchaButton" v-if="data.isShowCaptchaButton && data.isArrowSendCaptcha"
            @click="sendCaptchaHandle">发送验证码</button>
          <button class=" captchaButton buttonDisable" v-else-if="!data.isShowCaptchaButton"
            :disabled="!data.isShowCaptchaButton">
            {{ data.countDown }}S
          </button>
          <button class="captchaButton" v-else @click.prevent="">发送验证码</button>

        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetForm(formRef)">取消</el-button>
          <el-button v-if="data.formVisible == 1" type="primary" @click="submitForm(formRef)">登录</el-button>
          <el-button v-else-if="data.formVisible == 2" type="primary" @click="submitRegisterForm(formRef)">确认
          </el-button>
          <el-button v-else type="primary" @click="submitRegisterForm(formRef)">注册
          </el-button>
        </span>
        <div class="tri" v-if="data.formVisible == 1">
          <div class="tri-child">
            <i @click="toQcCode"></i>
            <img :src="data.qrUrl" alt="">
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<style lang="less">
.login {
  display: flex;

  .person {
    height: 30px;
    width: 30px;
    border-radius: 50%;
  }

  .user-avatar {
    cursor: pointer;
  }

  .username {
    margin-left: 5px;
    height: 30px;
    line-height: 30px;
    color: rgb(224, 221, 221);
    font-size: 12px;
    cursor: pointer;
  }

  .username:hover {
    color: white;
  }

}

.el-popper.is-light.el-popover.popoverBox {
  padding: 10px !important;
}

.popoverBox {
  width: 150px !important;

  .logout {
    text-align: center;
    padding: 5px 10px;
  }

  .logout:hover {
    background-color: #ecf5ff;
  }
}

.my-header {
  position: relative;

  a {
    font-size: 12px;
  }

  span {
    position: absolute;
    left: 50%;
    transform: translate(-50%, 0);
  }

  .forget-pwd {
    position: absolute;
    right: 0;
  }
}

.captchaInput {
  width: 150px;
  margin-right: 10px;
}

.captchaButton {
  width: 100px;
  padding: 5px 10px;
}

.buttonDisable {
  cursor: not-allowed;
}

.el-overlay-dialog {
  position: absolute;
  overflow: unset;
}

.qr-code {
  height: 240px;
  display: flex;
  justify-content: center;

  .item {
    text-align: center;
    width: 50%;

    a {
      margin: 0 3px;
      text-decoration: none;
      color: rgb(12, 115, 194);
    }
  }

  .img {
    height: 100%;
  }
}

.qr-code-footer {

  button {
    padding: 5px 10px;
    border-radius: 20px;
    border: 1px solid #a8a8a8;
    background-color: #fff;
    cursor: pointer;
  }
}

.el-dialog__footer {
  text-align: center;
  padding: 0;
  position: relative;

  button {
    margin-bottom: 10px;
  }

  .tri {
    position: absolute;
    right: 5px;
    bottom: 5px;
    height: 50px;
    width: 50px;

    .tri-child {
      position: relative;
      height: 50px;
      width: 50px;

      i {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        border-color: transparent transparent transparent white;
        border-width: 0 0 50px 50px;
        border-style: solid;
      }

      img {
        width: 100%;
      }
    }

  }
}

.login-container {
  .el-dialog {
    position: absolute;
    left: 50%;
    top: 50%;
    margin: auto;
    transform: translate(-50%, -50%);
  }
}



.qr-code-mask {
  position: relative;

  .mask {
    position: absolute;
    height: 100%;
    width: 100%;
    background-color: #fff;
    opacity: 0.9;

    span {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);

      button {
        padding: 2px 3px;
        border-radius: 5px px;
        margin-top: 3px;
        cursor: pointer;
      }
    }
  }
}
</style>