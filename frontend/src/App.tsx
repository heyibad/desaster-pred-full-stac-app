import { useMemo, useState } from "react";
import { apiLogin, apiPredict, apiRegister } from "./api";

type Prediction = {
  class_name: string;
  confidence: number;
};

type PredictionResponse = {
  top: Prediction;
  predictions: Prediction[];
};

const tokenKey = "disaster-token";

export default function App() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(localStorage.getItem(tokenKey));
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(() => (mode === "login" ? "Login" : "Register"), [mode]);

  async function handleAuthSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      if (mode === "register") {
        await apiRegister(email, password);
        setMode("login");
        return;
      }

      const data = await apiLogin(email, password);
      localStorage.setItem(tokenKey, data.access_token);
      setToken(data.access_token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Auth failed");
    }
  }

  function handleLogout() {
    localStorage.removeItem(tokenKey);
    setToken(null);
    setResult(null);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] || null;
    setFile(selected);
    setResult(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(selected ? URL.createObjectURL(selected) : null);
  }

  async function handlePredict() {
    if (!file || !token) return;
    setLoading(true);
    setError(null);

    try {
      const data = (await apiPredict(file, token)) as PredictionResponse;
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prediction failed");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen px-6 py-10">
        <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-orange-200/60 bg-white/80 p-8 shadow-2xl shadow-orange-200/40 backdrop-blur">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              Real-time disaster vision
            </div>
            <h1 className="text-balance text-4xl font-semibold text-slate-900 sm:text-5xl" style={{ fontFamily: "Space Grotesk" }}>
              Disaster Dekho
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Upload any image and instantly see the most likely disaster class with clear confidence scores.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "Fast YOLOv8 classifier",
                "Confidence table view",
                "Private login access",
                "Runs on your model",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-4">
              <div className="rounded-2xl bg-slate-900 px-5 py-4 text-white">
                <p className="text-xs uppercase tracking-wide text-orange-200">Model</p>
                <p className="text-lg font-semibold">YOLOv8m-cls</p>
              </div>
              <div className="rounded-2xl bg-orange-600 px-5 py-4 text-white">
                <p className="text-xs uppercase tracking-wide text-orange-200">Top speed</p>
                <p className="text-lg font-semibold">Instant results</p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200/70 bg-white p-8 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900" style={{ fontFamily: "Space Grotesk" }}>
                {title}
              </h2>
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                Access
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-500">Use email and password to continue.</p>

            <form className="mt-6 grid gap-4" onSubmit={handleAuthSubmit}>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Email
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  required
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-orange-400 focus:outline-none"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Password
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  required
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-orange-400 focus:outline-none"
                />
              </label>
              {error && <div className="rounded-2xl bg-red-50 px-4 py-2 text-sm font-medium text-red-600">{error}</div>}
              <button
                type="submit"
                className="rounded-2xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-500"
              >
                {mode === "login" ? "Login" : "Create Account"}
              </button>
            </form>
            <button
              className="mt-4 text-sm font-semibold text-orange-700"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
            >
              {mode === "login" ? "Need an account? Register" : "Have an account? Login"}
            </button>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-orange-500">Disaster Dekho</p>
            <h1 className="text-4xl font-semibold text-slate-900" style={{ fontFamily: "Space Grotesk" }}>
              Prediction Console
            </h1>
            <p className="mt-2 text-sm text-slate-500">Upload an image to see the predicted class and confidence.</p>
          </div>
          <button
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-orange-400 hover:text-orange-600"
            onClick={handleLogout}
          >
            Logout
          </button>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-orange-100/60 bg-white/90 p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Upload image</h2>
                <p className="text-sm text-slate-500">JPEG, PNG, WEBP up to 10MB.</p>
              </div>
              <label className="cursor-pointer rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
                Select image
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>

            {previewUrl ? (
              <div className="mt-6 overflow-hidden rounded-3xl border border-slate-100">
                <img
                  src={previewUrl}
                  alt="preview"
                  className="h-72 w-full object-cover"
                  onClick={() => previewUrl && window.open(previewUrl, "_blank")}
                />
                <div className="flex items-center justify-between bg-slate-50 px-4 py-3 text-xs text-slate-500">
                  Click image to open full size.
                  {file && <span>{file.name}</span>}
                </div>
              </div>
            ) : (
              <div className="mt-6 grid place-items-center rounded-3xl border border-dashed border-orange-200 bg-orange-50/40 py-12 text-center">
                <p className="text-sm font-medium text-orange-700">Drop an image to begin</p>
                <p className="text-xs text-slate-500">Your file stays in memory for prediction only.</p>
              </div>
            )}

            {error && <div className="mt-4 rounded-2xl bg-red-50 px-4 py-2 text-sm font-medium text-red-600">{error}</div>}

            <button
              className="mt-6 w-full rounded-2xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handlePredict}
              disabled={!file || loading}
            >
              {loading ? "Analyzing..." : "Predict"}
            </button>
          </section>

          <section className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-900">Prediction</h2>
            <p className="text-sm text-slate-500">Model output and confidence table.</p>

            {result ? (
              <div className="mt-6">
                <div className="rounded-2xl bg-orange-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-orange-500">Top class</p>
                  <div className="mt-2 flex items-center justify-between text-lg font-semibold text-slate-900">
                    <span>{result.top.class_name}</span>
                    <span>{result.top.confidence.toFixed(2)}%</span>
                  </div>
                </div>

                <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Class</th>
                        <th className="px-4 py-3">Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.predictions.map((item) => (
                        <tr key={item.class_name} className="border-t border-slate-100">
                          <td className="px-4 py-3 font-medium text-slate-700">{item.class_name}</td>
                          <td className="px-4 py-3 text-slate-600">{item.confidence.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                Upload an image to see prediction results.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
