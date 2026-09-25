import type { Metadata } from "next";
import { adminConfigured, isAuthed } from "@/lib/admin/auth";
import { getStore, storeMode } from "@/lib/admin/store";
import { Editor } from "@/components/admin/Editor";
import { Login } from "@/components/admin/Login";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Editor",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ project?: string }> };

export default async function AdminPage({ searchParams }: Props) {
  if (!adminConfigured())
    return (
      <Notice title="The editor is not set up yet">
        Add an <Code>ADMIN_PASSWORD</Code> environment variable. On your computer, put it in a{" "}
        <Code>.env.local</Code> file in the project folder and restart <Code>npm run dev</Code>. On
        the live site, add it in your Vercel project under Settings, Environment Variables, then
        redeploy.
      </Notice>
    );

  if (!(await isAuthed())) return <Login />;

  const mode = storeMode();
  if (mode === "unavailable")
    return (
      <Notice title="Saving is not set up yet">
        Add <Code>GITHUB_TOKEN</Code> and <Code>GITHUB_REPO</Code> in your Vercel project under
        Settings, Environment Variables, then redeploy. The setup guide in the project explains how.
      </Notice>
    );

  try {
    const content = await getStore().read();
    const { project } = await searchParams;
    return <Editor initial={content} mode={mode} focus={project} />;
  } catch (e) {
    return <Notice title="Could not load your content">{(e as Error).message}</Notice>;
  }
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-[560px] flex-col justify-center px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-[-0.03em]">{title}</h1>
      <p className="mt-4 leading-relaxed text-muted">{children}</p>
    </main>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return <code className="bg-bg-sunk px-1.5 py-0.5 font-mono text-[0.9em] text-fg">{children}</code>;
}
