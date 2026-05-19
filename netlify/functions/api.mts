import serverless from "serverless-http";
import app from "../../artifacts/api-server/src/app";

// Netlify routes /api/* → /.netlify/functions/api/:splat
// serverless-http wraps the Express app and handles the request/response translation
export const handler = serverless(app);
