import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export class EmailService {
  private static async logEmailSent(type: string, recipient: string, success: boolean, messageId?: string) {
    console.log(`[v0] Email ${type} to ${recipient}: ${success ? "SUCCESS" : "FAILED"}`, {
      messageId,
      timestamp: new Date().toISOString(),
    })
  }

  static async sendVerificationEmail(email: string, token: string): Promise<boolean> {
    try {
      const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify-email?token=${token}`

      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || "CodexAPI <noreply@codexapi.com>",
        to: [email],
        subject: "验证您的邮箱地址 - CodexAPI",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>验证您的邮箱地址</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700;">CodexAPI</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">专业的 AI API 中转服务</p>
              </div>
              
              <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 30px;">
                  <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <span style="color: white; font-size: 36px;">✉️</span>
                  </div>
                </div>
                
                <h2 style="color: #1a202c; margin-top: 0; font-size: 24px; text-align: center;">欢迎加入 CodexAPI！</h2>
                <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">感谢您注册 CodexAPI 账户。为了确保账户安全，请点击下面的按钮验证您的邮箱地址：</p>
                
                <div style="text-align: center; margin: 40px 0;">
                  <a href="${verificationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); transition: all 0.3s ease;">
                    验证邮箱地址
                  </a>
                </div>
                
                <div style="background: #f7fafc; border-left: 4px solid #667eea; padding: 16px; margin: 30px 0; border-radius: 4px;">
                  <p style="margin: 0; color: #4a5568; font-size: 14px;">
                    <strong>安全提示：</strong>此验证链接将在24小时后过期。如果您没有注册 CodexAPI 账户，请忽略此邮件。
                  </p>
                </div>
                
                <p style="color: #718096; font-size: 14px; margin-top: 30px;">如果按钮无法点击，请复制以下链接到浏览器地址栏：</p>
                <p style="background: #f7fafc; padding: 12px; border-radius: 6px; word-break: break-all; font-family: 'Monaco', 'Menlo', monospace; font-size: 13px; color: #4a5568; border: 1px solid #e2e8f0;">${verificationUrl}</p>
                
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 40px 0;">
                
                <div style="text-align: center;">
                  <p style="color: #a0aec0; font-size: 13px; margin: 0;">
                    此邮件由 CodexAPI 自动发送，请勿回复<br>
                    如有疑问，请联系 <a href="mailto:${process.env.EMAIL_REPLY_TO || "support@codexapi.com"}" style="color: #667eea;">技术支持</a>
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
      })

      if (error) {
        console.error("[v0] Resend error:", error)
        await this.logEmailSent("verification", email, false)
        return false
      }

      await this.logEmailSent("verification", email, true, data?.id)
      return true
    } catch (error) {
      console.error("[v0] Failed to send verification email:", error)
      await this.logEmailSent("verification", email, false)
      return false
    }
  }

  static async sendWelcomeEmail(email: string, username: string): Promise<boolean> {
    try {
      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || "CodexAPI <noreply@codexapi.com>",
        to: [email],
        subject: "🎉 欢迎来到 CodexAPI！",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>欢迎来到 CodexAPI</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
              <div style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
                <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700;">欢迎来到 CodexAPI！</h1>
              </div>
              
              <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                <h2 style="color: #1a202c; margin-top: 0; font-size: 24px;">您好，${username}！</h2>
                <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">恭喜您成功验证邮箱并加入 CodexAPI！现在您可以开始使用我们的专业 AI API 中转服务了。</p>
                
                <div style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); padding: 30px; border-radius: 12px; margin: 30px 0; border: 1px solid #e2e8f0;">
                  <h3 style="color: #2d3748; margin-top: 0; font-size: 18px; display: flex; align-items: center;">
                    <span style="margin-right: 10px;">🚀</span>
                    接下来您可以：
                  </h3>
                  <ul style="color: #4a5568; padding-left: 0; list-style: none;">
                    <li style="margin: 12px 0; display: flex; align-items: center;">
                      <span style="color: #48bb78; margin-right: 10px; font-weight: bold;">✓</span>
                      登录您的仪表板管理 API 密钥
                    </li>
                    <li style="margin: 12px 0; display: flex; align-items: center;">
                      <span style="color: #48bb78; margin-right: 10px; font-weight: bold;">✓</span>
                      使用兑换码获取套餐权益
                    </li>
                    <li style="margin: 12px 0; display: flex; align-items: center;">
                      <span style="color: #48bb78; margin-right: 10px; font-weight: bold;">✓</span>
                      查看详细的使用统计和分析
                    </li>
                    <li style="margin: 12px 0; display: flex; align-items: center;">
                      <span style="color: #48bb78; margin-right: 10px; font-weight: bold;">✓</span>
                      阅读 API 文档开始集成
                    </li>
                  </ul>
                </div>
                
                <div style="text-align: center; margin: 40px 0;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard" style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(72, 187, 120, 0.4); margin-right: 15px;">
                    进入仪表板
                  </a>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/docs" style="background: transparent; color: #48bb78; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; border: 2px solid #48bb78;">
                    查看文档
                  </a>
                </div>
                
                <div style="background: #fffbeb; border: 1px solid #f6e05e; padding: 20px; border-radius: 8px; margin: 30px 0;">
                  <h4 style="color: #744210; margin: 0 0 10px 0; font-size: 16px;">💡 快速开始提示</h4>
                  <p style="color: #744210; margin: 0; font-size: 14px;">
                    首次使用建议先创建一个 API 密钥，然后使用兑换码激活您的套餐。我们为新用户准备了详细的入门指南。
                  </p>
                </div>
                
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 40px 0;">
                
                <div style="text-align: center;">
                  <p style="color: #4a5568; font-size: 14px; margin: 0 0 10px 0;">
                    如有任何问题，请随时联系我们的技术支持团队
                  </p>
                  <p style="color: #a0aec0; font-size: 13px; margin: 0;">
                    感谢您选择 CodexAPI！
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
      })

      if (error) {
        console.error("[v0] Resend error:", error)
        await this.logEmailSent("welcome", email, false)
        return false
      }

      await this.logEmailSent("welcome", email, true, data?.id)
      return true
    } catch (error) {
      console.error("[v0] Failed to send welcome email:", error)
      await this.logEmailSent("welcome", email, false)
      return false
    }
  }

  static async sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
    try {
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`

      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || "CodexAPI <noreply@codexapi.com>",
        to: [email],
        subject: "🔒 重置您的密码 - CodexAPI",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>重置您的密码</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
              <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                <div style="font-size: 48px; margin-bottom: 10px;">🔒</div>
                <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700;">密码重置</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">CodexAPI</p>
              </div>
              
              <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                <h2 style="color: #1a202c; margin-top: 0; font-size: 24px;">重置您的密码</h2>
                <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">我们收到了您的密码重置请求。请点击下面的按钮设置新密码：</p>
                
                <div style="text-align: center; margin: 40px 0;">
                  <a href="${resetUrl}" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(240, 147, 251, 0.4);">
                    重置密码
                  </a>
                </div>
                
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 30px 0;">
                  <div style="display: flex; align-items: flex-start;">
                    <span style="color: #856404; font-size: 20px; margin-right: 12px; line-height: 1;">⚠️</span>
                    <div>
                      <h4 style="color: #856404; margin: 0 0 8px 0; font-size: 16px;">安全提示</h4>
                      <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.5;">
                        此链接将在 <strong>1 小时</strong> 后过期。如果您没有请求重置密码，请忽略此邮件并确保您的账户安全。
                      </p>
                    </div>
                  </div>
                </div>
                
                <p style="color: #718096; font-size: 14px; margin-top: 30px;">如果按钮无法点击，请复制以下链接到浏览器地址栏：</p>
                <p style="background: #f7fafc; padding: 12px; border-radius: 6px; word-break: break-all; font-family: 'Monaco', 'Menlo', monospace; font-size: 13px; color: #4a5568; border: 1px solid #e2e8f0;">${resetUrl}</p>
                
                <div style="background: #f0fff4; border: 1px solid #9ae6b4; padding: 20px; border-radius: 8px; margin: 30px 0;">
                  <h4 style="color: #22543d; margin: 0 0 10px 0; font-size: 16px;">🛡️ 账户安全建议</h4>
                  <ul style="color: #22543d; font-size: 14px; margin: 0; padding-left: 20px;">
                    <li>使用包含大小写字母、数字和特殊字符的强密码</li>
                    <li>不要在多个网站使用相同的密码</li>
                    <li>定期更新您的密码以确保账户安全</li>
                  </ul>
                </div>
                
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 40px 0;">
                
                <div style="text-align: center;">
                  <p style="color: #a0aec0; font-size: 13px; margin: 0;">
                    此邮件由 CodexAPI 自动发送，请勿回复<br>
                    如有疑问，请联系 <a href="mailto:${process.env.EMAIL_REPLY_TO || "support@codexapi.com"}" style="color: #f093fb;">技术支持</a>
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
      })

      if (error) {
        console.error("[v0] Resend error:", error)
        await this.logEmailSent("password-reset", email, false)
        return false
      }

      await this.logEmailSent("password-reset", email, true, data?.id)
      return true
    } catch (error) {
      console.error("[v0] Failed to send password reset email:", error)
      await this.logEmailSent("password-reset", email, false)
      return false
    }
  }

  static async sendSystemNotificationEmail(
    email: string,
    subject: string,
    title: string,
    message: string,
    type: "info" | "warning" | "error" = "info",
  ): Promise<boolean> {
    try {
      const typeConfig = {
        info: { color: "#3182ce", icon: "ℹ️", bgColor: "#ebf8ff" },
        warning: { color: "#d69e2e", icon: "⚠️", bgColor: "#fffbeb" },
        error: { color: "#e53e3e", icon: "❌", bgColor: "#fed7d7" },
      }

      const config = typeConfig[type]

      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || "CodexAPI <noreply@codexapi.com>",
        to: [email],
        subject: `${config.icon} ${subject} - CodexAPI`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${subject}</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
              <div style="background: ${config.color}; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                <div style="font-size: 48px; margin-bottom: 10px;">${config.icon}</div>
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">CodexAPI</h1>
              </div>
              
              <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                <h2 style="color: #1a202c; margin-top: 0; font-size: 24px;">${title}</h2>
                
                <div style="background: ${config.bgColor}; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid ${config.color};">
                  <p style="color: #1a202c; margin: 0; font-size: 16px; line-height: 1.6;">${message}</p>
                </div>
                
                <div style="text-align: center; margin: 40px 0;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard" style="background: ${config.color}; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
                    查看详情
                  </a>
                </div>
                
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 40px 0;">
                
                <div style="text-align: center;">
                  <p style="color: #a0aec0; font-size: 13px; margin: 0;">
                    此邮件由 CodexAPI 系统自动发送<br>
                    如有疑问，请联系 <a href="mailto:${process.env.EMAIL_REPLY_TO || "support@codexapi.com"}" style="color: ${config.color};">技术支持</a>
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
      })

      if (error) {
        console.error("[v0] Resend error:", error)
        await this.logEmailSent("system-notification", email, false)
        return false
      }

      await this.logEmailSent("system-notification", email, true, data?.id)
      return true
    } catch (error) {
      console.error("[v0] Failed to send system notification email:", error)
      await this.logEmailSent("system-notification", email, false)
      return false
    }
  }

  static async checkEmailServiceHealth(): Promise<boolean> {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.error("[v0] RESEND_API_KEY not configured")
        return false
      }

      // 简单的API健康检查
      const response = await fetch("https://api.resend.com/domains", {
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
      })

      return response.ok
    } catch (error) {
      console.error("[v0] Email service health check failed:", error)
      return false
    }
  }
}
