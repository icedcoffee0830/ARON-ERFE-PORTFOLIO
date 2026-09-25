# Portfolio

Next.js site with a built-in content editor at `/admin`.

## Editing content

Go to `yoursite.com/admin`, sign in, edit, and press **Save changes**.

- **On the live site**, each save becomes a commit on GitHub, and Vercel publishes it in about a minute.
- **On your computer** (`npm run dev`), saves go straight into the project files. Commit and push them yourself.

After signing in, an **Edit** button appears in the corner of every page on the site.

Content lives in `content/site.json` and `content/projects.json`. Images live in `public/work/<project>/`.

If you edited online, run `git pull` before working on your computer, so you have the latest content.

## One-time setup for the live editor

The editor needs three things in your Vercel project: a password, a GitHub key it can save with, and the repository name.

### 1. Create a GitHub key

1. Go to https://github.com/settings/personal-access-tokens/new (Settings → Developer settings → Fine-grained tokens).
2. **Token name**: `portfolio editor`. **Expiration**: pick a date, and set a reminder to renew it.
3. **Repository access**: *Only select repositories* → `ARON-ERFE-PORTFOLIO`.
4. **Permissions** → Repository permissions → **Contents: Read and write**.
5. Generate it and copy the token. GitHub shows it only once.

### 2. Add environment variables in Vercel

In your Vercel project go to **Settings → Environment Variables** and add:

| Name | Value |
|---|---|
| `ADMIN_PASSWORD` | A strong password you'll use to sign in to `/admin` |
| `ADMIN_SECRET` | Any long random text (signs the login cookie) |
| `GITHUB_TOKEN` | The token from step 1 |
| `GITHUB_REPO` | `icedcoffee0830/ARON-ERFE-PORTFOLIO` |

Then open **Deployments**, choose the latest one, and click **Redeploy** so the variables take effect.

### Local editor

Create `.env.local` in the project folder (it is never committed):

```
ADMIN_PASSWORD=choose-a-local-password
```

Run `npm run dev` and open http://localhost:3000/admin.

## Notes

- Projects switched to hidden are left off the live site. They still show on your computer so you can preview them.
- Photos are resized to at most 2400px and converted to WebP in your browser before upload.
- Changing `ADMIN_PASSWORD` or `ADMIN_SECRET` signs out every session.
