"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";

type AuthMode = "signin" | "signup";

type Notice = {
  id: string;
  title: string;
  body: string;
  course: string;
  priority: "Normal" | "Important" | "Urgent";
  createdAt: string;
  acknowledged: boolean;
};

type DemoUser = {
  name: string;
  email: string;
};

const seedNotices: Notice[] = [
  {
    id: "orientation",
    title: "Orientation schedule posted",
    body: "First-year orientation starts at 10:00 AM in Auditorium A. Bring your student ID.",
    course: "Campus",
    priority: "Important",
    createdAt: "Today, 8:15 AM",
    acknowledged: false,
  },
  {
    id: "lab",
    title: "Design lab moved",
    body: "The collage workshop for Visual Communication is now in Studio 204.",
    course: "ART-221",
    priority: "Normal",
    createdAt: "Yesterday, 5:40 PM",
    acknowledged: true,
  },
  {
    id: "fees",
    title: "Scholarship form deadline",
    body: "Submit scholarship renewal forms by Friday evening through the student office.",
    course: "Admin",
    priority: "Urgent",
    createdAt: "Mon, 2:10 PM",
    acknowledged: false,
  },
];

export default function Page() {
  const session = authClient.useSession();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("demo@collageboard.test");
  const [password, setPassword] = useState("password123");
  const [demoUser, setDemoUser] = useState<DemoUser | null>(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notices, setNotices] = useState<Notice[]>(seedNotices);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeBody, setNoticeBody] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("collageboard:notices");
    const savedUser = window.localStorage.getItem("collageboard:user");

    if (saved) {
      setNotices(JSON.parse(saved) as Notice[]);
    }

    if (savedUser) {
      setDemoUser(JSON.parse(savedUser) as DemoUser);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("collageboard:notices", JSON.stringify(notices));
  }, [notices]);

  const unreadCount = useMemo(
    () => notices.filter((notice) => !notice.acknowledged).length,
    [notices],
  );
  const activeUser = session.data?.user || demoUser;

  async function withTimeout<T>(promise: Promise<T>, timeout = 3500): Promise<T> {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        window.setTimeout(() => reject(new Error("Auth timed out")), timeout);
      }),
    ]);
  }

  function startDemoSession() {
    const nextUser = {
      name: name || email.split("@")[0],
      email,
    };

    window.localStorage.setItem("collageboard:user", JSON.stringify(nextUser));
    setDemoUser(nextUser);
  }

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      if (mode === "signup") {
        const result = await withTimeout(
          authClient.signUp.email({
            name: name || email.split("@")[0],
            email,
            password,
          }),
        );

        if (result.error) {
          startDemoSession();
          setMessage("Using local demo auth. The dashboard is ready.");
        } else {
          setMessage("Account created. You are signed in.");
          await session.refetch();
        }
      } else {
        const result = await withTimeout(
          authClient.signIn.email({
            email,
            password,
          }),
        );

        if (result.error) {
          startDemoSession();
          setMessage("Using local demo auth. The dashboard is ready.");
        } else {
          await session.refetch();
        }
      }
    } catch {
      startDemoSession();
      setMessage("Using local demo auth. The dashboard is ready.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    window.localStorage.removeItem("collageboard:user");
    setDemoUser(null);

    try {
      await withTimeout(authClient.signOut(), 1500);
      await session.refetch();
    } catch {
      return;
    }
  }

  function addNotice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!noticeTitle.trim() || !noticeBody.trim()) {
      return;
    }

    setNotices((current) => [
      {
        id: crypto.randomUUID(),
        title: noticeTitle.trim(),
        body: noticeBody.trim(),
        course: "General",
        priority: "Normal",
        createdAt: "Just now",
        acknowledged: false,
      },
      ...current,
    ]);
    setNoticeTitle("");
    setNoticeBody("");
  }

  function toggleNotice(id: string) {
    setNotices((current) =>
      current.map((notice) =>
        notice.id === id
          ? { ...notice, acknowledged: !notice.acknowledged }
          : notice,
      ),
    );
  }

  if (!activeUser) {
    return (
      <main className="min-h-screen bg-[#f6f4ef] text-[#1b1c1e]">
        <section className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-5 py-8 md:grid-cols-[1.1fr_0.9fr] md:px-8">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#2c6e6b]">
              College notice board
            </p>
            <h1 className="max-w-2xl text-5xl font-semibold leading-tight text-[#151719] md:text-6xl">
              Collageboard
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#5f6472]">
              A compact demo for campus notices, quick acknowledgements, and a
              simple student dashboard.
            </p>
            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
              {["3 live notices", "2 pending", "1 urgent"].map((item) => (
                <div
                  key={item}
                  className="border border-[#d8d0c4] bg-white px-4 py-3 text-sm font-semibold text-[#34373d]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={handleAuth}
            className="border border-[#d8d0c4] bg-white p-6 shadow-[0_24px_80px_rgba(35,31,25,0.12)]"
          >
            <div className="mb-6 grid grid-cols-2 border border-[#d8d0c4] p-1">
              {(["signin", "signup"] as AuthMode[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setMode(item);
                    setMessage("");
                  }}
                  className={`px-4 py-3 text-sm font-semibold transition ${
                    mode === item
                      ? "bg-[#1b1c1e] text-white"
                      : "text-[#5f6472] hover:bg-[#f6f4ef]"
                  }`}
                >
                  {item === "signin" ? "Sign in" : "Sign up"}
                </button>
              ))}
            </div>

            {mode === "signup" ? (
              <label className="mb-4 block text-sm font-semibold text-[#34373d]">
                Name
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-2 w-full border border-[#d8d0c4] px-4 py-3 font-normal outline-none transition focus:border-[#2c6e6b]"
                  placeholder="Aritra"
                />
              </label>
            ) : null}

            <label className="mb-4 block text-sm font-semibold text-[#34373d]">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full border border-[#d8d0c4] px-4 py-3 font-normal outline-none transition focus:border-[#2c6e6b]"
                required
              />
            </label>

            <label className="mb-5 block text-sm font-semibold text-[#34373d]">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full border border-[#d8d0c4] px-4 py-3 font-normal outline-none transition focus:border-[#2c6e6b]"
                minLength={8}
                required
              />
            </label>

            {message ? (
              <p className="mb-4 border border-[#e0b8aa] bg-[#fff2ec] px-4 py-3 text-sm text-[#8b3324]">
                {message}
              </p>
            ) : null}

            {session.isPending ? (
              <p className="mb-4 text-sm font-medium text-[#77705f]">
                Checking saved server session...
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#2c6e6b] px-5 py-3 font-semibold text-white transition hover:bg-[#235a58] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Working..."
                : mode === "signin"
                  ? "Sign in"
                  : "Create account"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f4ef] text-[#1b1c1e]">
      <header className="border-b border-[#d8d0c4] bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5 md:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#2c6e6b]">
              Collageboard
            </p>
            <h1 className="text-2xl font-semibold">
              Welcome, {activeUser.name || activeUser.email}
            </h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="border border-[#1b1c1e] px-4 py-2 text-sm font-semibold transition hover:bg-[#1b1c1e] hover:text-white"
          >
            Logout
          </button>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-8 md:grid-cols-[0.75fr_1.25fr] md:px-8">
        <aside className="space-y-4">
          <div className="border border-[#d8d0c4] bg-white p-5">
            <p className="text-sm font-semibold text-[#5f6472]">Pending notices</p>
            <p className="mt-2 text-5xl font-semibold">{unreadCount}</p>
          </div>

          <form onSubmit={addNotice} className="border border-[#d8d0c4] bg-white p-5">
            <h2 className="text-lg font-semibold">Post a notice</h2>
            <input
              value={noticeTitle}
              onChange={(event) => setNoticeTitle(event.target.value)}
              className="mt-4 w-full border border-[#d8d0c4] px-3 py-2 outline-none transition focus:border-[#2c6e6b]"
              placeholder="Notice title"
            />
            <textarea
              value={noticeBody}
              onChange={(event) => setNoticeBody(event.target.value)}
              className="mt-3 min-h-28 w-full resize-none border border-[#d8d0c4] px-3 py-2 outline-none transition focus:border-[#2c6e6b]"
              placeholder="Details students should see"
            />
            <button
              type="submit"
              className="mt-3 w-full bg-[#2c6e6b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#235a58]"
            >
              Publish notice
            </button>
          </form>
        </aside>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Notice feed</h2>
            <p className="text-sm font-medium text-[#5f6472]">
              {notices.length} total
            </p>
          </div>

          {notices.map((notice) => (
            <article
              key={notice.id}
              className="border border-[#d8d0c4] bg-white p-5 transition hover:border-[#2c6e6b]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2c6e6b]">
                    {notice.course} / {notice.priority}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold">{notice.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => toggleNotice(notice.id)}
                  className={`border px-3 py-2 text-sm font-semibold transition ${
                    notice.acknowledged
                      ? "border-[#d8d0c4] text-[#5f6472] hover:bg-[#f6f4ef]"
                      : "border-[#2c6e6b] bg-[#2c6e6b] text-white hover:bg-[#235a58]"
                  }`}
                >
                  {notice.acknowledged ? "Acknowledged" : "Mark read"}
                </button>
              </div>
              <p className="mt-3 leading-7 text-[#4f535c]">{notice.body}</p>
              <p className="mt-4 text-sm font-medium text-[#77705f]">
                {notice.createdAt}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
