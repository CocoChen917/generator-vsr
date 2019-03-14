import axios from 'axios';
import config from '../config';

import appFunction from '@/utils/appFunction';

let affiliate = Cookies.getJSON('affiliate');
let commonParams = Store.session.get('commonParams');

axios.defaults.baseURL = config.API_URL;
axios.defaults.timeout = config.TIMEOUT;
axios.defaults.headers = config.HEADERS;

let clientVersion = '4.2.0';
if (affiliate && affiliate.platform){
  clientVersion = `4.2.0-${affiliate.platform}`;
}

let reqConfig = {
  params: {
    platform: (affiliate && affiliate.platform) || 'wap', // 标识支付宝应用
    channel: (affiliate && affiliate.channel) || 'ms',
    rent_mode: 2, // 1是预约，2是不限时
  },
  headers: {
    'Content-Type': 'application/json',
    'client-version': clientVersion, // 接口版本控制
  },
  withCredentials: false,
  isCheckErroCode: true, // 是否检测 erroCodeState 状态
  isToast: false, // 是否走通用 Toast
  isAccess: true, // 是否带上token 值，false 不需要权限，true需要权限
  loading: false, // 是否显示请求加载动画
};

function getBaseURL(options, is_wx) {
  let baseURL;

  if (is_wx) {
    baseURL = config.WX_URL;
  } else if (options.config && options.config.type === 'CSB') {
    baseURL = config.API_CSB_URL;
  } else {
    baseURL = config.API_URL;
  }

  return baseURL;
}

// 请求拦截器
axios.interceptors.request.use((request) => {
  if (!config.CONSOLE) {
    console.log(
      `${new Date().toLocaleString()}【 M=${request.url} 】P=`,
      request.params || request.data,
    );
  }

  request.headers = Object.assign({}, request.headers, reqConfig.headers);

  return request;
}, (error) => {
  Toast.offline(String(error));
  return Promise.reject(error);
});

// 接口返回status错误处理
const errorCodeState = (res) => {
  if (res.data && res.data.status != 'ok' && res.data.error) {
    let commonParams = Store.session.get('commonParams');
    // token超时状态 和 单点登录状态 access_token 超时 从新触发登录
    if (res.data.error.code == '11008' || res.data.error.code == '10001') {
      // token 失效登录
      // 需要在页面单独处理
      if (commonParams && commonParams.platform && commonParams.platform == 'app') {
        const data = { type: 'login' };
        setTimeout(() => {
          if (Tool.webViewType() == 'android') {
            appFunction.useAndroidFunction(data);
          } else {
            appFunction.useIosFunction(data);
          }
        }, 100);
        return false;
      } else {
        let toUrl = encodeURIComponent(window.document.location.href);

        if (toUrl){
          window.document.location.href = `${window.document.location.origin}/login.html?toUrl=${toUrl}`;
        } else {
          window.document.location.href = `${window.document.location.origin}/login.html`;
        }

        return false;
      }
    }
    // TODO: 拦截器无法获取 res.config.config 参数
    reqConfig = Object.assign({}, reqConfig, res.config.config);

    if (reqConfig.isToast) {
      Toast.info(`${res.data.error.message} !!!~` || res.data.error.code, 1.5);
    }
  }
};

// 响应拦截器
axios.interceptors.response.use((res) => {
  if (res.status >= 200 && res.status < 300) {
    if (!config.CONSOLE) {
      // eslint-disable-next-line no-console
      console.log(
        `${new Date().toLocaleString()}【 M=${res.config.url} 】【接口响应：】`,
        res.data,
      );
    }
    errorCodeState(res);
    return res.data;
  }
  Toast.offline(res.statusText);
  throw new Error(res.statusText);
}, (error) => {
  // Toast.offline(String(error));
  return Promise.reject(error);
});

export default (options = { method: 'GET' }) => {
  const access_token = Cookies.get('access_token');

  let reqConfigParams = Object.assign({}, reqConfig.params, options.params || {});
  let newReqConfig = Object.assign({}, reqConfig, {params: reqConfigParams}, options.config || {});

  if (access_token && newReqConfig.isAccess){
    options.data = Object.assign({}, reqConfig.params, options.data, {'access_token': access_token});
  } else {
    options.data = Object.assign({}, reqConfig.params, options.data);
  }

  let isdata = true;

  if (
    options.method.toUpperCase() !== 'POST'
    && options.method.toUpperCase() !== 'PUT'
    && options.method.toUpperCase() !== 'PATCH'
    // && options.method.toUpperCase() !== 'DELETE'
  ) {
    isdata = false;
  }

  return axios({
    method: options.method,
    baseURL: getBaseURL(options),
    url: options.url,
    data: isdata ? options.data : null,
    params: !isdata ? options.data : null,
    config: options.config,
  });
};
