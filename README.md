# 🎭 Playwright TypeScript Automation Framework

<div align="center">

![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)

E2E Web UI Automation Framework được xây dựng với Playwright + TypeScript Strict Mode.

</div>

---

## 📋 Prerequisites

| Tool | Version tối thiểu |
|------|------------------|
| Node.js | >= 18.0.0 |
| npm | >= 8.0.0 |

---

## 🚀 Quick Start

### 1. Clone & cài đặt dependencies

```bash
git clone <repository-url>
cd playwright-typescript
npm install
```

### 2. Cài đặt Playwright browsers

```bash
npx playwright install chromium
```

### 3. Cấu hình môi trường

```bash
# Copy template
cp .env.example .env

# Điền thông tin thực tế vào .env
# BASE_URL=https://your-app.com
# TEST_USERNAME=your_email@example.com
# TEST_PASSWORD=your_password
```

### 4. Chạy tests & Báo cáo Allure

```bash
# Chạy tất cả tests (headless)
npm test

# Chạy với giao diện browser (headed mode) — để debug
npm run test:headed

# Chạy interactive debug mode
npm run test:debug

# Chạy test và tự động sinh + mở Allure Report trên local
npm run test:allure

# Chỉ sinh Allure Report (sau khi đã chạy test)
npm run allure:generate

# Mở Allure Report trên trình duyệt local
npm run allure:open

# Dọn dẹp kết quả test Allure cũ
npm run allure:clean
```

---

## 📁 Project Structure

```
playwright-typescript/
├── playwright.config.ts          # Cấu hình Playwright (baseURL, timeout, reporters)
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript strict mode config
├── .env.example                  # Template biến môi trường
├── .gitignore
├── README.md
│
├── src/
│   ├── pages/                    # Page Object Model classes
│   │   ├── base.page.ts          # Base class — common UI methods
│   │   ├── login.page.ts         # Login page interactions
│   │   └── dashboard.page.ts     # Dashboard page interactions
│   │
│   ├── fixtures/                 # Playwright custom fixtures
│   │   ├── base.fixture.ts       # Extends test with page objects
│   │   └── auth.fixture.ts       # Authenticated page fixture
│   │
│   ├── utils/                    # Utilities & helpers
│   │   ├── env.config.ts         # Environment config reader (typed)
│   │   ├── test-data.ts          # Test data generator (unique + traceable)
│   │   ├── helpers.ts            # Common helper functions
│   │   └── logger.ts             # Structured logger
│   │
│   └── tests/                    # Test specs
│       ├── auth/
│       │   ├── auth.setup.ts     # Global auth setup (runs once)
│       │   └── login.spec.ts     # Login test cases
│       └── dashboard/
│           └── dashboard.spec.ts # Dashboard test cases
│
├── test-data/                    # External test data (JSON/YAML)
│   └── users.json
│
└── .github/
    └── workflows/
        └── playwright.yml        # GitHub Actions CI pipeline
```

---

## 🏗️ Architecture Overview

### Design Pattern: Page Object Model (POM)

```
Test Spec → Fixture → Page Object → BasePage → Playwright API
```

- **Test Spec** (`*.spec.ts`) — test logic only (Arrange → Act → Assert)
- **Fixture** — dependency injection, khởi tạo page objects
- **Page Object** — encapsulate UI interactions theo từng page
- **BasePage** — common methods tái sử dụng (click, fill, wait...)

### Authentication Pattern

Framework dùng **Storage State** để tái sử dụng session:
1. `auth.setup.ts` chạy 1 lần → login → lưu state vào `test-results/.auth/user.json`
2. Tất cả tests sau dùng state đã lưu → không cần login lại

---

## 🧪 Viết Test Mới

### 1. Tạo Page Object

```typescript
// src/pages/my.page.ts
import { type Page } from '@playwright/test';
import { BasePage } from './base.page';

export class MyPage extends BasePage {
  // Khai báo locators tại đây (không inline trong test)
  readonly myButton = this.page.getByRole('button', { name: 'Submit' });
  
  constructor(page: Page) {
    super(page, 'MyPage');
  }
  
  async clickSubmit(): Promise<void> {
    await this.click(this.myButton, 'Submit button');
  }
}
```

### 2. Thêm vào Fixture

```typescript
// src/fixtures/base.fixture.ts — thêm vào PageFixtures
myPage: MyPage;

// Thêm factory vào test.extend()
myPage: async ({ page }, use) => {
  await use(new MyPage(page));
},
```

### 3. Viết Test Spec

```typescript
// src/tests/my-feature/my.spec.ts
import { test, expect } from '../../fixtures/base.fixture';

test.describe('My Feature', () => {
  test('TC-001: Feature hoạt động đúng', async ({ myPage, page }) => {
    // Arrange
    await myPage.goto();
    
    // Act
    await myPage.clickSubmit();
    
    // Assert
    await expect(page).toHaveURL(/\/success/);
  });
});
```

---

## ⚙️ Cấu hình

### Environment Variables

| Variable | Mô tả | Default |
|----------|-------|---------|
| `BASE_URL` | URL hệ thống cần test | `http://localhost:3000` |
| `TEST_USERNAME` | Email tài khoản test | - |
| `TEST_PASSWORD` | Mật khẩu tài khoản test | - |
| `DEFAULT_TIMEOUT` | Timeout tổng thể (ms) | `60000` |
| `NAVIGATION_TIMEOUT` | Timeout navigation (ms) | `30000` |
| `LOG_LEVEL` | Mức log (`DEBUG`/`INFO`) | `INFO` |

### Scripts

| Command | Mô tả |
|---------|-------|
| `npm test` | Chạy tất cả tests (headless) |
| `npm run test:headed` | Chạy với browser visible |
| `npm run test:debug` | Chạy với Playwright Inspector |
| `npm run test:allure` | Dọn dẹp -> Chạy test -> Sinh & Mở Allure Report local |
| `npm run allure:generate` | Sinh báo cáo Allure tĩnh từ kết quả kiểm thử |
| `npm run allure:open` | Mở báo cáo Allure trên web server local |
| `npm run allure:clean` | Xóa các thư mục allure-results và allure-report cũ |
| `npm run test:auth` | Chỉ chạy auth tests |
| `npm run test:dashboard` | Chỉ chạy dashboard tests |
| `npm run typecheck` | Kiểm tra TypeScript errors |
| `npm run lint` | Lint TypeScript code |

---

## 🔄 CI/CD — GitHub Actions

### Setup Secrets

Vào **Settings > Secrets and variables > Actions** → thêm:

| Secret | Giá trị |
|--------|---------|
| `BASE_URL` | URL production/staging |
| `TEST_USERNAME` | Email tài khoản test |
| `TEST_PASSWORD` | Mật khẩu tài khoản test |

### Allure Report trên CI

Pipeline CI tự động tạo Allure Report và deploy trực tiếp lên **GitHub Pages**:
- **Branch lưu trữ report:** `gh-pages`
- **Xem trực tiếp:** `https://<your-github-username>.github.io/<your-repo-name>/`
- Tự động tích hợp và hiển thị biểu đồ lịch sử chạy test (history) qua tối đa 20 phiên chạy gần nhất.

### Trigger

Pipeline tự động chạy khi:
- Push lên `main` hoặc `develop`
- Tạo Pull Request vào `main` hoặc `develop`
- Chạy thủ công qua `workflow_dispatch`

---

## 📏 Coding Conventions

### Naming

| Loại | Convention | Ví dụ |
|------|-----------|-------|
| Page class | `PascalCase` + `Page` suffix | `LoginPage` |
| Test file | `kebab-case.spec.ts` | `login.spec.ts` |
| Test case | `TC-MODULE-NNN: mô tả` | `TC-LOGIN-001: Login thành công` |
| Locator | `camelCase` + mô tả | `loginButton`, `emailInput` |
| Fixture | `camelCase` + `Page/Fixture` | `loginPage`, `authFixture` |

### Quy tắc bắt buộc

- ✅ Luôn import `test` từ `../../fixtures/base.fixture` (không từ `@playwright/test`)
- ✅ Locator khai báo trong Page class, không inline trong test
- ✅ Dùng smart waits (`expect().toBeVisible()`, không `waitForTimeout`)
- ✅ Test data unique: dùng `TestDataGenerator` hoặc timestamp
- ❌ Không hardcode URL/credentials trong code
- ❌ Không commit `.env`
- ❌ Không dùng `console.log` — dùng `Logger`

---

## 🐛 Debug Tips

```bash
# Chạy 1 test cụ thể
npx playwright test login.spec.ts

# Chạy 1 test case theo tên
npx playwright test --grep "TC-LOGIN-001"

# Chạy với headed mode + slow motion
npx playwright test --headed --slow-mo=500

# Xem trace sau khi test fail
npx playwright show-trace test-results/<path>/trace.zip
```

---

## 📞 Support

Liên hệ team QA Automation nếu cần hỗ trợ hoặc mở Issue trong repository.
