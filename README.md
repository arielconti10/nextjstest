This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Next.js Conditional UI

A modern, flexible UI for building complex conditional logic and automation rules.

## Features

### Conditional Automation

- **Multiple Conditions**: Create complex rules with multiple conditions per rule
- **Field Types**: Support for text and numeric fields with appropriate operators
- **Smart Operators**: Context-aware operators that change based on field type
  - Text: contains, equals, starts with, ends with, regex, etc.
  - Numbers: equals, greater than, less than, between, etc.
- **Visual Feedback**: Real-time preview of conditions in plain English
- **Match Logic**: Choose between "Match All" (AND) or "Match Any" (OR) for conditions
- **Fallback Values**: Set default values with "Else" condition

### Formula Mode

- Support for mathematical expressions and functions
- Column references using square brackets (e.g., [Price] \* 1.2)
- Built-in functions: SUM, AVG, COUNT, MIN, MAX

## Getting Started

1. Navigate to the Automation Settings
2. Toggle automation on/off
3. Choose between Conditional or Formula mode
4. Build your rules:
   - Add conditions with fields and operators
   - Set values and replacements
   - Add multiple rules as needed
   - Set a default (else) value

## Usage Example

```typescript
// Example rule structure
{
  conditions: [
    { field: "company_name", operator: "contains", value: "Tech" },
    { field: "revenue", operator: "greater_than", value: "1000000" }
  ],
  matchType: "all",
  replacement: "Enterprise Client"
}
```
