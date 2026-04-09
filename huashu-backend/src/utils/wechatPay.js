const crypto = require('crypto');
const fs = require('fs');

/**
 * 微信支付 V3 签名验证工具函数
 * @param {string} signature - 请求头中的 Wechatpay-Signature
 * @param {string} timestamp - 请求头中的 Wechatpay-Timestamp
 * @param {string} nonce - 请求头中的 Wechatpay-Nonce
 * @param {string} body - 原始请求体字符串
 * @returns {boolean} - 验签结果
 */
exports.verifySignature = (signature, timestamp, nonce, body) => {
  try {
    // 构造验签串: HTTP_METHOD + \n + URL + \n + TIMESTAMP + \n + NONCE + \n + BODY + \n
    // 在 Express Webhook 中，METHOD 一般是 POST，URL 是 /api/v1/payment/wechat/webhook
    const method = 'POST';
    const url = '/api/v1/payment/wechat/webhook'; // 请根据实际路由调整

    const message = `${method}\n${url}\n${timestamp}\n${nonce}\n${body}\n`;

    // 实际生产环境中，需要从环境变量或配置文件读取微信支付平台公钥证书内容
    const WECHAT_PAY_PUBLIC_KEY = process.env.WECHAT_PAY_PUBLIC_KEY;

    if (!WECHAT_PAY_PUBLIC_KEY) {
      console.warn("未配置微信支付公钥，跳过真实验签 (仅限本地测试)");
      return true; // 仅测试用
    }

    const verify = crypto.createVerify('SHA256');
    verify.update(message);
    verify.end();

    return verify.verify(WECHAT_PAY_PUBLIC_KEY, signature, 'base64');
  } catch (error) {
    console.error('微信验签失败:', error);
    return false;
  }
};

/**
 * 解密微信支付回调的 resource.ciphertext 数据
 */
exports.decryptResource = (ciphertext, nonce, associatedData) => {
  try {
    const WECHAT_PAY_API_V3_KEY = process.env.WECHAT_PAY_API_V3_KEY;
    if (!WECHAT_PAY_API_V3_KEY) {
      throw new Error("未配置 WECHAT_PAY_API_V3_KEY");
    }

    const authTagLength = 16;
    const encryptedData = Buffer.from(ciphertext, 'base64');
    const authTag = encryptedData.slice(encryptedData.length - authTagLength);
    const data = encryptedData.slice(0, encryptedData.length - authTagLength);

    const decipher = crypto.createDecipheriv('aes-256-gcm', WECHAT_PAY_API_V3_KEY, nonce);
    decipher.setAuthTag(authTag);
    decipher.setAAD(Buffer.from(associatedData));

    let decrypted = decipher.update(data, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  } catch (error) {
    console.error('解密微信支付回调数据失败:', error);
    return null;
  }
};
