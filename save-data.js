// netlify/functions/save-data.js

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return cors(200, {});
  }

  if (event.httpMethod !== 'POST') {
    return cors(405, { error: 'Method not allowed' });
  }

  // ── Read env vars ──────────────────────────────────────────────
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'qa2025admin';
  const GITHUB_TOKEN   = process.env.GITHUB_TOKEN;
  const GITHUB_REPO    = process.env.GITHUB_REPO;
  const GITHUB_BRANCH  = process.env.GITHUB_BRANCH || 'main';

  // ── Parse body ─────────────────────────────────────────────────
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return cors(400, { error: 'Invalid JSON in request body' });
  }

  // ── Auth ───────────────────────────────────────────────────────
  if (!body.password || body.password !== ADMIN_PASSWORD) {
    return cors(401, { error: 'Incorrect password' });
  }

  // ── Env check ──────────────────────────────────────────────────
  if (!GITHUB_TOKEN) {
    return cors(500, {
      error: 'GITHUB_TOKEN is not set. Go to Netlify → Site configuration → Environment variables and add it.'
    });
  }
  if (!GITHUB_REPO) {
    return cors(500, {
      error: 'GITHUB_REPO is not set. Add it in Netlify → Site configuration → Environment variables. Format: username/repo-name'
    });
  }

  // ── Validate data ──────────────────────────────────────────────
  if (!body.data || typeof body.data !== 'object') {
    return cors(400, { error: 'No data provided to save' });
  }

  const FILE_PATH = 'data.json';
  const apiBase   = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;
  const ghHeaders = {
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'Content-Type': 'application/json',
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'portfolio-cms'
  };

  try {
    // ── Step 1: Get current SHA ────────────────────────────────
    let sha = null;
    const getRes = await fetch(`${apiBase}?ref=${GITHUB_BRANCH}`, { headers: ghHeaders });

    if (getRes.ok) {
      const fileData = await getRes.json();
      sha = fileData.sha;
    } else if (getRes.status === 401) {
      return cors(500, { error: 'GitHub token is invalid or expired. Generate a new one at github.com/settings/tokens' });
    } else if (getRes.status === 403) {
      return cors(500, { error: 'GitHub token does not have "repo" permission. Regenerate with full repo scope.' });
    } else if (getRes.status === 404) {
      // File doesn't exist yet — will create it
      sha = null;
    } else {
      const errBody = await getRes.text();
      return cors(500, { error: `GitHub API error (${getRes.status}): ${errBody}` });
    }

    // ── Step 2: Encode content ─────────────────────────────────
    const newContent = JSON.stringify(body.data, null, 2);
    const encoded    = Buffer.from(newContent, 'utf8').toString('base64');

    // ── Step 3: Commit to GitHub ───────────────────────────────
    const putPayload = {
      message: `chore: update content via CMS (${new Date().toUTCString()})`,
      content: encoded,
      branch:  GITHUB_BRANCH
    };
    if (sha) putPayload.sha = sha;

    const putRes = await fetch(apiBase, {
      method:  'PUT',
      headers: ghHeaders,
      body:    JSON.stringify(putPayload)
    });

    if (putRes.ok) {
      return cors(200, { success: true, message: 'Saved! Site will update in ~30 seconds.' });
    }

    const putErr = await putRes.json().catch(() => ({ message: putRes.statusText }));

    if (putRes.status === 409) {
      return cors(500, { error: 'Conflict: file was updated elsewhere. Refresh the admin page and try again.' });
    }
    if (putRes.status === 422) {
      return cors(500, { error: `Validation error from GitHub: ${putErr.message}` });
    }

    return cors(500, { error: `GitHub PUT failed (${putRes.status}): ${putErr.message}` });

  } catch (err) {
    console.error('[save-data] Unexpected error:', err);
    return cors(500, { error: `Server error: ${err.message}` });
  }
};

function cors(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    },
    body: JSON.stringify(body)
  };
}
