"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink, Code, BookOpen } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useToast } from "@/hooks/use-toast"

export default function DocsPage() {
  const { toast } = useToast()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "已复制到剪贴板" })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-2">
          <BookOpen className="w-6 h-6" />
          <h1 className="text-3xl font-bold">API 文档</h1>
        </div>

        {/* Quick Start */}
        <Card>
          <CardHeader>
            <CardTitle>快速开始</CardTitle>
            <CardDescription>几分钟内开始使用 CodexAPI</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">1. 获取 API 密钥</h3>
              <p className="text-muted-foreground mb-2">在仪表板中创建您的 API 密钥</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">2. 设置基础 URL</h3>
              <div className="bg-muted p-3 rounded-md font-mono text-sm flex items-center justify-between">
                <code>https://api.codexapi.dev/v1</code>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard("https://api.codexapi.dev/v1")}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">3. 发送请求</h3>
              <p className="text-muted-foreground">使用标准的 OpenAI API 格式发送请求</p>
            </div>
          </CardContent>
        </Card>

        {/* Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle>API 端点</CardTitle>
            <CardDescription>支持的 API 端点列表</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Chat Completions */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Badge variant="default">POST</Badge>
                <code className="text-sm font-mono">/v1/chat/completions</code>
              </div>
              <p className="text-muted-foreground">创建聊天完成请求</p>

              <div className="space-y-2">
                <h4 className="font-medium">请求示例:</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm overflow-x-auto">
                  <pre>{`curl https://api.codexapi.dev/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "gpt-5",
    "messages": [
      {
        "role": "user",
        "content": "Hello, how are you?"
      }
    ],
    "max_tokens": 100
  }'`}</pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() =>
                      copyToClipboard(`curl https://api.codexapi.dev/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "model": "gpt-5",
    "messages": [
      {
        "role": "user",
        "content": "Hello, how are you?"
      }
    ],
    "max_tokens": 100
  }'`)
                    }
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    复制
                  </Button>
                </div>
              </div>
            </div>

            {/* Models */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">GET</Badge>
                <code className="text-sm font-mono">/v1/models</code>
              </div>
              <p className="text-muted-foreground">获取可用模型列表</p>

              <div className="space-y-2">
                <h4 className="font-medium">请求示例:</h4>
                <div className="bg-muted p-3 rounded-md font-mono text-sm overflow-x-auto">
                  <pre>{`curl https://api.codexapi.dev/v1/models \\
  -H "Authorization: Bearer YOUR_API_KEY"`}</pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() =>
                      copyToClipboard(`curl https://api.codexapi.dev/v1/models \\
  -H "Authorization: Bearer YOUR_API_KEY"`)
                    }
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    复制
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Code Examples */}
        <Card>
          <CardHeader>
            <CardTitle>代码示例</CardTitle>
            <CardDescription>不同编程语言的使用示例</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Python */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Code className="w-5 h-5" />
                <span>Python</span>
              </h3>
              <div className="bg-muted p-3 rounded-md font-mono text-sm overflow-x-auto">
                <pre>{`import openai

openai.api_base = "https://api.codexapi.dev/v1"
openai.api_key = "YOUR_API_KEY"

response = openai.ChatCompletion.create(
    model="gpt-5",
    messages=[
        {"role": "user", "content": "Hello, how are you?"}
    ],
    max_tokens=100
)

print(response.choices[0].message.content)`}</pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() =>
                    copyToClipboard(`import openai

openai.api_base = "https://api.codexapi.dev/v1"
openai.api_key = "YOUR_API_KEY"

response = openai.ChatCompletion.create(
    model="gpt-5",
    messages=[
        {"role": "user", "content": "Hello, how are you?"}
    ],
    max_tokens=100
)

print(response.choices[0].message.content)`)
                  }
                >
                  <Copy className="w-4 h-4 mr-2" />
                  复制
                </Button>
              </div>
            </div>

            {/* JavaScript */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Code className="w-5 h-5" />
                <span>JavaScript</span>
              </h3>
              <div className="bg-muted p-3 rounded-md font-mono text-sm overflow-x-auto">
                <pre>{`const response = await fetch('https://api.codexapi.dev/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    model: 'gpt-5',
    messages: [
      { role: 'user', content: 'Hello, how are you?' }
    ],
    max_tokens: 100
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);`}</pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() =>
                    copyToClipboard(`const response = await fetch('https://api.codexapi.dev/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    model: 'gpt-5',
    messages: [
      { role: 'user', content: 'Hello, how are you?' }
    ],
    max_tokens: 100
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);`)
                  }
                >
                  <Copy className="w-4 h-4 mr-2" />
                  复制
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rate Limits */}
        <Card>
          <CardHeader>
            <CardTitle>速率限制</CardTitle>
            <CardDescription>了解 API 的使用限制</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-semibold">免费账户</h4>
                <p className="text-2xl font-bold text-green-500">10K</p>
                <p className="text-sm text-muted-foreground">tokens/天</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-semibold">专业版</h4>
                <p className="text-2xl font-bold text-blue-500">50K</p>
                <p className="text-sm text-muted-foreground">tokens/天</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-semibold">企业版</h4>
                <p className="text-2xl font-bold text-purple-500">200K</p>
                <p className="text-sm text-muted-foreground">tokens/天</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Codes */}
        <Card>
          <CardHeader>
            <CardTitle>错误代码</CardTitle>
            <CardDescription>常见错误代码和解决方案</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold">401 - Unauthorized</h4>
                <p className="text-muted-foreground">API 密钥无效或缺失</p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4">
                <h4 className="font-semibold">429 - Rate Limit Exceeded</h4>
                <p className="text-muted-foreground">超出速率限制，请稍后重试</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold">400 - Bad Request</h4>
                <p className="text-muted-foreground">请求格式错误或参数无效</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card>
          <CardHeader>
            <CardTitle>技术支持</CardTitle>
            <CardDescription>需要帮助？联系我们的技术支持团队</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Button variant="outline">
                <ExternalLink className="w-4 h-4 mr-2" />
                联系支持
              </Button>
              <Button variant="outline">
                <ExternalLink className="w-4 h-4 mr-2" />
                社区论坛
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
