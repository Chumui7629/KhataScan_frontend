# Khatascan – Expense Tracker & Receipt Digitizer

Khatascan is a mobile-first expense tracking application designed to help small businesses and shopkeepers manage their expenses and digitize receipts through an intuitive dashboard.

## Features

- **Expense Dashboard:** View total expenses and budget information.
- **Receipt Scanning:** Access the receipt scanning and upload interface.
- **Expense Categories:** Visualize spending distribution across categories.
- **Recent Receipts:** Browse recently uploaded receipts.
- **Receipt Details:** View individual receipt information.
- **Analytics:** Access expense analytics.
- **Settings:** Manage application preferences.

*Note: Feature availability depends on the connected backend APIs.*

## Tech Stack

- React
- Vite
- JavaScript
- CSS
- Axios (API communication)

## Project Structure

```text
frontend/
├── public/
├── src/
│   ├── api/
│   ├── components/
│   ├── pages/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env.example
├── package.json
└── vite.config.js
```

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

Clone the repository:

```bash
git clone https://github.com/priangshuxyz/khatascan-frontend.git
```

Navigate into the project:

```bash
cd khatascan-frontend
```

Install dependencies:

```bash
npm install
```

### Environment Configuration

Create a `.env` file in the frontend root directory using `.env.example` as a reference.

Configure the backend API URL:

```env
VITE_API_URL=your_backend_api_url
```

Use the actual backend URL configured for your environment.

### Run Locally

```bash
npm run dev
```

Vite will display the local development URL in your terminal.

### Production Build

```bash
npm run build
```

## Backend Repository

The backend is maintained separately:

[Khatascan Backend](https://github.com/SanjhukSA/receipts-backend)

## Future Improvements

- Improve receipt scanning and data extraction.
- Expand expense analytics.
- Improve mobile responsiveness.
- Add additional expense management features.

## Contributors

Developed collaboratively as the Khatascan project.

---

**Khatascan – Making expense tracking simpler.**
