# 贡献指南

感谢您对 CodexAPI 项目的关注！我们欢迎所有形式的贡献，包括但不限于：

- 🐛 错误报告
- 💡 功能建议
- 📝 文档改进
- 🔧 代码贡献
- 🧪 测试用例
- 🌐 国际化翻译

## 📋 目录

- [开始之前](#开始之前)
- [开发环境设置](#开发环境设置)
- [贡献流程](#贡献流程)
- [代码规范](#代码规范)
- [提交规范](#提交规范)
- [Pull Request 指南](#pull-request-指南)
- [问题报告](#问题报告)
- [功能建议](#功能建议)

## 开始之前

### 行为准则

参与本项目即表示您同意遵守我们的行为准则：

- 使用友好和包容的语言
- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表示同理心

### 贡献类型

我们欢迎以下类型的贡献：

#### 🐛 错误报告
- 发现并报告软件缺陷
- 提供重现步骤和环境信息
- 协助验证修复方案

#### 💡 功能建议
- 提出新功能想法
- 改进现有功能的建议
- 用户体验优化建议

#### 📝 文档贡献
- 改进 README 和文档
- 添加代码注释
- 编写教程和示例

#### 🔧 代码贡献
- 修复已知问题
- 实现新功能
- 性能优化
- 重构代码

## 开发环境设置

### 系统要求

- **Node.js**: 18.0+ (推荐使用 LTS 版本)
- **MySQL**: 8.0+
- **Redis**: 7.0+ (可选)
- **Git**: 2.0+

### 环境配置

1. **Fork 并克隆项目**

\`\`\`bash
# Fork 项目到你的 GitHub 账户
# 然后克隆你的 fork

git clone https://github.com/YOUR_USERNAME/codexapi-proxy.git
cd codexapi-proxy

# 添加上游仓库
git remote add upstream https://github.com/ORIGINAL_OWNER/codexapi-proxy.git
\`\`\`

2. **安装依赖**

\`\`\`bash
npm install
\`\`\`

3. **环境变量配置**

\`\`\`bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑环境变量
nano .env.local
\`\`\`

4. **数据库设置**

\`\`\`bash
# 创建数据库
npm run db:create

# 运行迁移
npm run db:migrate

# 初始化测试数据
npm run init:test-data
\`\`\`

5. **启动开发服务器**

\`\`\`bash
npm run dev
\`\`\`

### 开发工具

推荐使用以下工具提高开发效率：

- **IDE**: VS Code + 推荐扩展
- **数据库工具**: MySQL Workbench, phpMyAdmin
- **API 测试**: Postman, Insomnia
- **Git 工具**: GitKraken, SourceTree

### VS Code 推荐扩展

\`\`\`json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
\`\`\`

## 贡献流程

### 1. 选择任务

- 查看 [Issues](../../issues) 寻找待解决的问题
- 查看 [Project Board](../../projects) 了解项目规划
- 选择标有 `good first issue` 的问题作为入门
- 选择标有 `help wanted` 的问题参与贡献

### 2. 创建分支

\`\`\`bash
# 确保主分支是最新的
git checkout main
git pull upstream main

# 创建新的特性分支
git checkout -b feature/your-feature-name

# 或者修复分支
git checkout -b fix/issue-number-description
\`\`\`

### 3. 开发和测试

\`\`\`bash
# 开发过程中定期提交
git add .
git commit -m "feat: add new feature"

# 运行测试
npm run test

# 运行类型检查
npm run type-check

# 运行代码检查
npm run lint

# 格式化代码
npm run format
\`\`\`

### 4. 提交更改

\`\`\`bash
# 推送到你的 fork
git push origin feature/your-feature-name
\`\`\`

### 5. 创建 Pull Request

1. 访问你的 GitHub fork
2. 点击 "Compare & pull request"
3. 填写 PR 模板
4. 等待代码审查

## 代码规范

### TypeScript 规范

- 使用严格的 TypeScript 配置
- 为所有函数和变量提供类型注解
- 避免使用 `any` 类型
- 使用接口定义对象结构

\`\`\`typescript
// ✅ 好的示例
interface User {
  id: string;
  email: string;
  role: UserRole;
}

async function getUser(id: string): Promise<User | null> {
  // 实现
}

// ❌ 避免的示例
function getUser(id: any): any {
  // 实现
}
\`\`\`

### React 组件规范

- 使用函数组件和 Hooks
- 组件名使用 PascalCase
- Props 接口以 Props 结尾
- 使用 TypeScript 进行类型定义

\`\`\`typescript
// ✅ 好的示例
interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
}

export function UserCard({ user, onEdit }: UserCardProps) {
  return (
    <div className="p-4 border rounded">
      <h3>{user.email}</h3>
      <button onClick={() => onEdit(user)}>编辑</button>
    </div>
  );
}
\`\`\`

### CSS 和样式规范

- 使用 Tailwind CSS 进行样式设计
- 优先使用 Tailwind 类名
- 避免内联样式
- 使用语义化的类名

\`\`\`typescript
// ✅ 好的示例
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h2 className="text-xl font-semibold text-gray-900">标题</h2>
  <button className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">
    操作
  </button>
</div>

// ❌ 避免的示例
<div style={{ display: 'flex', padding: '16px' }}>
  <h2 style={{ fontSize: '20px' }}>标题</h2>
</div>
\`\`\`

### API 路由规范

- 使用 RESTful API 设计
- 正确使用 HTTP 状态码
- 统一的错误处理格式
- 添加适当的验证

\`\`\`typescript
// ✅ 好的示例
export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await getUserData(user.id);
    return NextResponse.json({ data });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
\`\`\`

### 数据库规范

- 使用 TypeORM 实体定义
- 正确设置关系和索引
- 使用事务处理复杂操作
- 添加适当的验证

\`\`\`typescript
// ✅ 好的示例
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column()
  @IsEnum(UserRole)
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
\`\`\`

## 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

### 提交格式

\`\`\`
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
\`\`\`

### 提交类型

- `feat`: 新功能
- `fix`: 错误修复
- `docs`: 文档更新
- `style`: 代码格式调整（不影响功能）
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动
- `ci`: CI/CD 相关变更

### 提交示例

\`\`\`bash
# 新功能
git commit -m "feat(auth): add JWT token refresh mechanism"

# 错误修复
git commit -m "fix(api): resolve user registration validation issue"

# 文档更新
git commit -m "docs: update API documentation with new endpoints"

# 重构
git commit -m "refactor(database): optimize user query performance"
\`\`\`

### 提交最佳实践

1. **原子性提交**：每个提交只包含一个逻辑变更
2. **清晰的描述**：使用现在时态，简洁明了
3. **适当的范围**：指明影响的模块或功能
4. **详细的正文**：复杂变更需要详细说明

## Pull Request 指南

### PR 模板

创建 PR 时，请填写以下信息：

\`\`\`markdown
## 变更描述
简要描述这个 PR 的目的和内容

## 变更类型
- [ ] 错误修复
- [ ] 新功能
- [ ] 文档更新
- [ ] 性能优化
- [ ] 代码重构
- [ ] 其他

## 测试
- [ ] 已添加测试用例
- [ ] 所有测试通过
- [ ] 手动测试完成

## 检查清单
- [ ] 代码遵循项目规范
- [ ] 已更新相关文档
- [ ] 提交信息符合规范
- [ ] 已解决所有冲突

## 相关 Issue
Closes #issue_number

## 截图（如适用）
添加相关截图

## 其他说明
其他需要说明的内容
\`\`\`

### PR 审查流程

1. **自动检查**：CI/CD 流水线自动运行
2. **代码审查**：维护者进行代码审查
3. **测试验证**：确保功能正常工作
4. **文档检查**：确保文档同步更新
5. **合并决定**：维护者决定是否合并

### PR 最佳实践

- **保持小而专注**：每个 PR 只解决一个问题
- **清晰的标题**：使用描述性的标题
- **详细的描述**：解释变更的原因和方法
- **及时响应**：积极回应审查意见
- **保持更新**：定期同步主分支

## 问题报告

### 报告错误

使用 [Bug Report 模板](../../issues/new?template=bug_report.md) 报告错误：

\`\`\`markdown
## 错误描述
清晰简洁地描述错误

## 重现步骤
1. 访问 '...'
2. 点击 '....'
3. 滚动到 '....'
4. 看到错误

## 期望行为
描述你期望发生的情况

## 实际行为
描述实际发生的情况

## 环境信息
- OS: [e.g. macOS 12.0]
- Browser: [e.g. Chrome 95.0]
- Node.js: [e.g. 18.17.0]
- 项目版本: [e.g. 1.2.0]

## 附加信息
添加任何其他相关信息、截图或日志
\`\`\`

### 报告安全问题

**请勿在公开 Issue 中报告安全漏洞！**

如果发现安全问题，请通过以下方式私下报告：

1. 发送邮件到：security@example.com
2. 使用 GitHub Security Advisory
3. 联系项目维护者

## 功能建议

使用 [Feature Request 模板](../../issues/new?template=feature_request.md) 提出功能建议：

\`\`\`markdown
## 功能描述
清晰简洁地描述你想要的功能

## 问题背景
这个功能解决了什么问题？

## 解决方案
描述你希望的解决方案

## 替代方案
描述你考虑过的其他解决方案

## 附加信息
添加任何其他相关信息或截图
\`\`\`

## 社区

### 沟通渠道

- **GitHub Issues**: 错误报告和功能建议
- **GitHub Discussions**: 一般讨论和问答
- **Pull Requests**: 代码审查和讨论

### 获取帮助

1. **查看文档**：首先查看 README 和文档
2. **搜索 Issues**：查看是否有类似问题
3. **创建 Discussion**：在讨论区提问
4. **联系维护者**：通过 GitHub 联系

### 社区准则

- 保持友好和专业
- 尊重不同观点
- 提供建设性反馈
- 帮助新贡献者
- 遵循行为准则

## 认可贡献者

我们使用 [All Contributors](https://allcontributors.org/) 规范来认可所有贡献者：

- 代码贡献者
- 文档贡献者
- 问题报告者
- 功能建议者
- 测试贡献者
- 设计贡献者

## 许可证

通过贡献代码，您同意您的贡献将在与项目相同的 [MIT 许可证](LICENSE) 下获得许可。

---

感谢您的贡献！🎉

如果您有任何问题，请随时通过 [GitHub Issues](../../issues) 或 [Discussions](../../discussions) 联系我们。
\`\`\`

\`\`\`text file="LICENSE"
MIT License

Copyright (c) 2024 CodexAPI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
