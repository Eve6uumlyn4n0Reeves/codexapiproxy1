// 性能监控和优化工具
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // 记录性能指标
  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    this.metrics.get(name)!.push(value)

    // 保持最近100个记录
    const values = this.metrics.get(name)!
    if (values.length > 100) {
      values.shift()
    }
  }

  // 获取性能统计
  getStats(name: string) {
    const values = this.metrics.get(name) || []
    if (values.length === 0) return null

    const sum = values.reduce((a, b) => a + b, 0)
    const avg = sum / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)

    return { avg, min, max, count: values.length }
  }

  // 清除指标
  clearMetrics(name?: string) {
    if (name) {
      this.metrics.delete(name)
    } else {
      this.metrics.clear()
    }
  }
}

// 性能装饰器
export function measurePerformance(name: string) {
  return (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: unknown[]) {
      const start = performance.now()
      try {
        const result = await originalMethod.apply(this, args)
        const duration = performance.now() - start
        PerformanceMonitor.getInstance().recordMetric(name, duration)
        return result
      } catch (error) {
        const duration = performance.now() - start
        PerformanceMonitor.getInstance().recordMetric(`${name}_error`, duration)
        throw error
      }
    }

    return descriptor
  }
}

// Web Vitals 监控
export function initWebVitals() {
  if (typeof window === "undefined") return

  // 监控 CLS (Cumulative Layout Shift)
  let clsValue = 0
  const clsEntries: PerformanceEntry[] = []

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const layoutShiftEntry = entry as PerformanceEntry
      if (!layoutShiftEntry.hadRecentInput) {
        clsValue += layoutShiftEntry.value
        clsEntries.push(layoutShiftEntry)
      }
    }
  })

  observer.observe({ type: "layout-shift", buffered: true })

  // 监控 LCP (Largest Contentful Paint)
  new PerformanceObserver((list) => {
    const entries = list.getEntries()
    const lastEntry = entries[entries.length - 1]
    PerformanceMonitor.getInstance().recordMetric("lcp", lastEntry.startTime)
  }).observe({ type: "largest-contentful-paint", buffered: true })

  // 监控 FID (First Input Delay)
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const fidEntry = entry as PerformanceEntry
      PerformanceMonitor.getInstance().recordMetric("fid", fidEntry.processingStart - fidEntry.startTime)
    }
  }).observe({ type: "first-input", buffered: true })

  // 页面卸载时记录 CLS
  window.addEventListener("beforeunload", () => {
    PerformanceMonitor.getInstance().recordMetric("cls", clsValue)
  })
}

// 资源加载监控
export function monitorResourceLoading() {
  if (typeof window === "undefined") return

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const resource = entry as PerformanceResourceTiming
      PerformanceMonitor.getInstance().recordMetric(`resource_${resource.initiatorType}`, resource.duration)
    }
  })

  observer.observe({ type: "resource", buffered: true })
}

// 内存使用监控
export function monitorMemoryUsage() {
  if (typeof window === "undefined" || !("memory" in performance)) return

  setInterval(() => {
    const memory = (performance as { memory: MemoryInfo }).memory
    PerformanceMonitor.getInstance().recordMetric("memory_used", memory.usedJSHeapSize)
    PerformanceMonitor.getInstance().recordMetric("memory_total", memory.totalJSHeapSize)
  }, 30000) // 每30秒记录一次
}

interface PerformanceEntry {
  value: number
  processingStart: number
  startTime: number
  hadRecentInput?: boolean
}

interface MemoryInfo {
  usedJSHeapSize: number
  totalJSHeapSize: number
}
