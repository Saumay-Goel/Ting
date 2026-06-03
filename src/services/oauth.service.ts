const BASE = process.env.OAUTH_REDIRECT_BASE!;

// ---------- GOOGLE ----------
export function getGoogleAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${BASE}/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function getGoogleProfile(code: string) {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${BASE}/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });
  const { access_token } = await tokenRes.json();

  const profileRes = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: { Authorization: `Bearer ${access_token}` },
    },
  );
  const p = await profileRes.json();
  return {
    providerId: p.id as string,
    email: p.email as string,
    name: p.name as string,
  };
}

// ---------- GITHUB ----------
export function getGithubAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    redirect_uri: `${BASE}/auth/github/callback`,
    scope: "read:user user:email",
  });
  return `https://github.com/login/oauth/authorize?${params}`;
}

export async function getGithubProfile(code: string) {
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      code,
      client_id: process.env.GITHUB_CLIENT_ID!,
      client_secret: process.env.GITHUB_CLIENT_SECRET!,
      redirect_uri: `${BASE}/auth/github/callback`,
    }),
  });
  const { access_token } = await tokenRes.json();

  const profileRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${access_token}`, "User-Agent": "Ting" },
  });
  const p = await profileRes.json();

  let email = p.email;
  if (!email) {
    const emailRes = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "User-Agent": "Ting",
      },
    });
    const emails = await emailRes.json();
    const primary = emails.find((e: any) => e.primary && e.verified);
    email = primary?.email;
  }

  return {
    providerId: String(p.id),
    email: email as string,
    name: p.name as string,
  };
}
