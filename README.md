# Kopiopastat.org

Kopiopastat.org is a Finnish copypasta wiki website built with Next.js for the frontend and a separate backend API (assumed to be running on `http://127.0.0.1:8080`). It allows users to browse, search, create, edit, and manage copypastas (Finnish internet memes and text snippets), with features like image uploads, history tracking, recent edits, and user authentication for admin actions.

The site is fully localized in Finnish, with a responsive design supporting light and dark themes. It includes infinite scrolling on mobile for browse and recent edits pages, and various UI enhancements like image expansion, copy-to-clipboard functionality, and confirmation dialogs for destructive actions.

## Features

- **Browse Copypastas**: Paginated or infinite scroll view of all entries.
- **Search**: Real-time search with at least 3 characters.
- **Create/Edit**: Authenticated users can add new copypastas or edit existing ones, including image uploads (JPG, PNG, AVIF) via file input or clipboard paste.
- **History**: View edit history with diff comparisons.
- **Recent Edits**: List of latest changes, including image additions.
- **Random**: Redirect to a random copypasta.
- **Authentication**: Login via code for admin features (delete, edit, etc.).
- **Themes**: Light/dark mode toggle.
- **Responsive**: Mobile-optimized with adaptive layouts.
- **SEO**: Meta tags, Open Graph support for sharing.

## Installation and Development

### Prerequisites

- Node.js (version 18 or higher recommended)
- npm or yarn
- A running backend API server at `http://127.0.0.1:8080` (this project assumes the backend is separate and handles endpoints like `/browse`, `/pasta`, `/edit`, etc.)

### Setup

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd kopiopastat
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Configure the backend**:
   - Ensure your backend is running on `http://127.0.0.1:8080`.
   - The frontend proxies image requests to the backend via Next.js rewrites (configured in `next.config.js`).

4. **Run in development mode**:
   ```
   npm run dev
   ```
   - The app will start on `http://localhost:3000`.
   - Hot reloading is enabled for development.

5. **Build for production** (optional for testing):
   ```
   npm run build
   npm start
   ```
   - This builds the app and starts it on `http://localhost:3000`.

### Development Notes

- **Backend Integration**: All API calls are in `utils/api.js`. Update `API_BASE` if your backend URL changes.
- **Styling**: Uses Tailwind CSS. Custom styles are in `styles/globals.css`.
- **Translations**: All user-facing text is in `utils/translations.js`. Add new keys as needed.
- **Authentication**: Uses localStorage for tokens. Login via `/login` with a code.
- **Linting**: Run `npm run lint` to check code quality.
- **Testing**: No tests are included; add Jest or similar if needed.

## Running in Production

1. **Build the application**:
   ```
   npm run build
   ```

2. **Start the production server**:
   ```
   npm start
   ```
   - The app will run on port 3000 by default. Use environment variables or a reverse proxy (e.g., Nginx) to serve on port 80/443.

3. **Backend Requirements**:
   - Ensure the backend is deployed separately and accessible at the configured URL.
   - For production, update `API_BASE` in `utils/api.js` to point to your production backend URL (e.g., `https://api.kopiopastat.org`).
   - Handle CORS, SSL, and rate limiting on the backend.

4. **Deployment Options**:
   - **Vercel/Netlify**: Deploy directly from GitHub. Update `next.config.js` rewrites for image proxying.
   - **Docker**: Create a Dockerfile for containerization.
     ```
     FROM node:18-alpine
     WORKDIR /app
     COPY package*.json ./
     RUN npm ci --only=production
     COPY . .
     RUN npm run build
     EXPOSE 3000
     CMD ["npm", "start"]
     ```
   - **Server**: Use PM2 or systemd to manage the process.
     ```
     npm install -g pm2
     pm2 start npm --name "kopiopastat" -- start
     ```

5. **Environment Variables**:
   - Set `NODE_ENV=production` for optimizations.
   - If needed, add env vars for API URLs in `next.config.js`.

6. **Security**:
   - Ensure HTTPS in production.
   - Backend should handle authentication securely (e.g., JWT).
   - Sanitize user inputs on both frontend and backend.

## Contributing

- Fork the repo and submit pull requests.
- Follow the existing code style (ESLint config).
- Test changes locally with the backend.

## License

This project is open-source. Check the license file for details.
