import { EmailService } from "../email"
import { logger } from "../logger"

export interface AlertRule {
  id: string
  name: string
  description: string
  condition: AlertCondition
  severity: "low" | "medium" | "high" | "critical"
  enabled: boolean
  cooldownMinutes: number
  recipients: string[]
}

export interface AlertCondition {
  metric: string
  operator: "gt" | "lt" | "eq" | "gte" | "lte"
  threshold: number
  timeWindow?: number // minutes
}

export interface Alert {
  id: string
  ruleId: string
  ruleName: string
  severity: "low" | "medium" | "high" | "critical"
  message: string
  value: number
  threshold: number
  timestamp: Date
  resolved: boolean
  resolvedAt?: Date
}

export class AlertManager {
  private static instance: AlertManager
  private alerts: Map<string, Alert> = new Map()
  private lastAlertTime: Map<string, Date> = new Map()
  private alertRules: AlertRule[] = []

  constructor() {
    this.initializeDefaultRules()
  }

  static getInstance(): AlertManager {
    if (!AlertManager.instance) {
      AlertManager.instance = new AlertManager()
    }
    return AlertManager.instance
  }

  private initializeDefaultRules() {
    this.alertRules = [
      {
        id: "high-error-rate",
        name: "高错误率告警",
        description: "API错误率超过5%",
        condition: {
          metric: "api.error_rate",
          operator: "gt",
          threshold: 5,
          timeWindow: 5,
        },
        severity: "high",
        enabled: true,
        cooldownMinutes: 15,
        recipients: [process.env.ADMIN_EMAIL || "admin@codexapi.com"],
      },
      {
        id: "database-connection-failure",
        name: "数据库连接失败",
        description: "数据库连接失败或响应时间过长",
        condition: {
          metric: "database.health",
          operator: "eq",
          threshold: 0, // 0 = unhealthy
        },
        severity: "critical",
        enabled: true,
        cooldownMinutes: 5,
        recipients: [process.env.ADMIN_EMAIL || "admin@codexapi.com"],
      },
      {
        id: "high-memory-usage",
        name: "内存使用率过高",
        description: "内存使用率超过85%",
        condition: {
          metric: "system.memory_usage",
          operator: "gt",
          threshold: 85,
        },
        severity: "medium",
        enabled: true,
        cooldownMinutes: 30,
        recipients: [process.env.ADMIN_EMAIL || "admin@codexapi.com"],
      },
      {
        id: "api-response-time",
        name: "API响应时间过长",
        description: "平均响应时间超过2秒",
        condition: {
          metric: "api.avg_response_time",
          operator: "gt",
          threshold: 2000,
          timeWindow: 10,
        },
        severity: "medium",
        enabled: true,
        cooldownMinutes: 20,
        recipients: [process.env.ADMIN_EMAIL || "admin@codexapi.com"],
      },
      {
        id: "openai-api-failure",
        name: "OpenAI API服务异常",
        description: "OpenAI API连接失败或不可用",
        condition: {
          metric: "openai.health",
          operator: "eq",
          threshold: 0, // 0 = unhealthy
        },
        severity: "high",
        enabled: true,
        cooldownMinutes: 10,
        recipients: [process.env.ADMIN_EMAIL || "admin@codexapi.com"],
      },
    ]
  }

  async checkAlerts(metrics: Record<string, number>): Promise<void> {
    for (const rule of this.alertRules) {
      if (!rule.enabled) continue

      const metricValue = metrics[rule.condition.metric]
      if (metricValue === undefined) continue

      const shouldAlert = this.evaluateCondition(rule.condition, metricValue)

      if (shouldAlert) {
        await this.triggerAlert(rule, metricValue)
      } else {
        // 检查是否需要解决现有告警
        await this.resolveAlert(rule.id)
      }
    }
  }

  private evaluateCondition(condition: AlertCondition, value: number): boolean {
    switch (condition.operator) {
      case "gt":
        return value > condition.threshold
      case "lt":
        return value < condition.threshold
      case "eq":
        return value === condition.threshold
      case "gte":
        return value >= condition.threshold
      case "lte":
        return value <= condition.threshold
      default:
        return false
    }
  }

  private async triggerAlert(rule: AlertRule, value: number): Promise<void> {
    const now = new Date()
    const lastAlert = this.lastAlertTime.get(rule.id)

    // 检查冷却时间
    if (lastAlert) {
      const cooldownMs = rule.cooldownMinutes * 60 * 1000
      if (now.getTime() - lastAlert.getTime() < cooldownMs) {
        return
      }
    }

    const alertId = `${rule.id}_${now.getTime()}`
    const alert: Alert = {
      id: alertId,
      ruleId: rule.id,
      ruleName: rule.name,
      severity: rule.severity,
      message: `${rule.description} - 当前值: ${value}, 阈值: ${rule.condition.threshold}`,
      value,
      threshold: rule.condition.threshold,
      timestamp: now,
      resolved: false,
    }

    this.alerts.set(alertId, alert)
    this.lastAlertTime.set(rule.id, now)

    // 发送告警通知
    await this.sendAlertNotification(alert, rule)

    logger.warn("Alert triggered", {
      alertId,
      ruleName: rule.name,
      severity: rule.severity,
      value,
      threshold: rule.condition.threshold,
    })
  }

  private async resolveAlert(ruleId: string): Promise<void> {
    const activeAlert = Array.from(this.alerts.values()).find((alert) => alert.ruleId === ruleId && !alert.resolved)

    if (activeAlert) {
      activeAlert.resolved = true
      activeAlert.resolvedAt = new Date()

      logger.info("Alert resolved", {
        alertId: activeAlert.id,
        ruleName: activeAlert.ruleName,
        duration: activeAlert.resolvedAt.getTime() - activeAlert.timestamp.getTime(),
      })
    }
  }

  private async sendAlertNotification(alert: Alert, rule: AlertRule): Promise<void> {
    try {
      const subject = `🚨 ${alert.severity.toUpperCase()} - ${alert.ruleName}`
      const title = `系统告警: ${alert.ruleName}`
      const message = `
        <strong>告警详情:</strong><br>
        • 告警规则: ${alert.ruleName}<br>
        • 严重程度: ${alert.severity.toUpperCase()}<br>
        • 当前值: ${alert.value}<br>
        • 阈值: ${alert.threshold}<br>
        • 触发时间: ${alert.timestamp.toLocaleString("zh-CN")}<br><br>
        
        <strong>描述:</strong><br>
        ${rule.description}<br><br>
        
        请及时检查系统状态并采取必要的措施。
      `

      const emailType = alert.severity === "critical" ? "error" : alert.severity === "high" ? "warning" : "info"

      for (const recipient of rule.recipients) {
        await EmailService.sendSystemNotificationEmail(
          recipient,
          subject,
          title,
          message,
          emailType as "info" | "warning" | "error",
        )
      }

      logger.info("Alert notification sent", {
        alertId: alert.id,
        recipients: rule.recipients.length,
        severity: alert.severity,
      })
    } catch (error) {
      logger.error("Failed to send alert notification", {
        alertId: alert.id,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  // 获取活跃告警
  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter((alert) => !alert.resolved)
  }

  // 获取告警历史
  getAlertHistory(limit = 50): Alert[] {
    return Array.from(this.alerts.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  // 添加自定义告警规则
  addAlertRule(rule: AlertRule): void {
    this.alertRules.push(rule)
    logger.info("Alert rule added", { ruleId: rule.id, ruleName: rule.name })
  }

  // 更新告警规则
  updateAlertRule(ruleId: string, updates: Partial<AlertRule>): boolean {
    const ruleIndex = this.alertRules.findIndex((rule) => rule.id === ruleId)
    if (ruleIndex === -1) return false

    this.alertRules[ruleIndex] = { ...this.alertRules[ruleIndex], ...updates }
    logger.info("Alert rule updated", { ruleId, updates })
    return true
  }

  // 删除告警规则
  removeAlertRule(ruleId: string): boolean {
    const ruleIndex = this.alertRules.findIndex((rule) => rule.id === ruleId)
    if (ruleIndex === -1) return false

    this.alertRules.splice(ruleIndex, 1)
    logger.info("Alert rule removed", { ruleId })
    return true
  }

  // 获取所有告警规则
  getAlertRules(): AlertRule[] {
    return [...this.alertRules]
  }
}

export const alertManager = AlertManager.getInstance()
