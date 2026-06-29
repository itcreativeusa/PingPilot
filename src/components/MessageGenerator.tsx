"use client";

import { useEffect, useState } from "react";
import { deleteDraft, getDrafts, saveDraft } from "@/lib/localDrafts";
import type { MessageForm, SavedDraft } from "@/lib/types";

const initialForm: MessageForm = {
  recipientName: "",
  recipientCompany: "",
  recipientRole: "",
  channel: "LinkedIn",
  tone: "Friendly",
  goal: "",
  context: ""
};

export default function MessageGenerator() {
  const [form, setForm] = useState<MessageForm>(initialForm);
  const [message, setMessage] = useState("");
  const [drafts, setDrafts] = useState<SavedDraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState("");

  useEffect(() => {
    setDrafts(getDrafts());
  }, []);

  function updateForm(name: keyof MessageForm, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setUploadedFileName("");
      return;
    }

    setSelectedFile(file);
    setUploadedFileName(file.name);
    setError("");
  }

  async function generateMessage() {
    setLoading(true);
    setError("");

    try {
      const payload = selectedFile
        ? (() => {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("recipientName", form.recipientName);
            formData.append("recipientCompany", form.recipientCompany);
            formData.append("recipientRole", form.recipientRole);
            formData.append("channel", form.channel);
            formData.append("tone", form.tone);
            formData.append("goal", form.goal);
            formData.append("context", form.context);
            return formData;
          })()
        : JSON.stringify({ ...form, fileContext: form.fileContext || "" });

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: selectedFile ? undefined : { "Content-Type": "application/json" },
        body: payload
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setMessage(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate message.");
    } finally {
      setLoading(false);
    }
  }

  function handleSaveDraft() {
    if (!message) return;

    const draft: SavedDraft = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      channel: form.channel,
      recipientName: form.recipientName || "Unknown recipient",
      message
    };

    saveDraft(draft);
    setDrafts(getDrafts());
  }

  async function copyMessage(text: string) {
    await navigator.clipboard.writeText(text);
  }

  function handleDeleteDraft(id: string) {
    deleteDraft(id);
    setDrafts(getDrafts());
  }

  const mailtoLink = `mailto:?subject=${encodeURIComponent("Quick intro")}&body=${encodeURIComponent(message)}`;
  const linkedInLink = "https://www.linkedin.com/messaging/";

  return (
    <div className="grid">
      <section className="card">
        <h2>Create message</h2>

        <label>Recipient name</label>
        <input value={form.recipientName} onChange={(e) => updateForm("recipientName", e.target.value)} placeholder="Name or client name" />

        <label>Company</label>
        <input value={form.recipientCompany} onChange={(e) => updateForm("recipientCompany", e.target.value)} placeholder="Company name" />

        <label>Role</label>
        <input value={form.recipientRole} onChange={(e) => updateForm("recipientRole", e.target.value)} placeholder="Hiring Manager" />

        <label>Channel</label>
        <select value={form.channel} onChange={(e) => updateForm("channel", e.target.value)}>
          <option>LinkedIn</option>
          <option>Email</option>
        </select>

        <label>Tone</label>
        <select value={form.tone} onChange={(e) => updateForm("tone", e.target.value)}>
          <option>Professional</option>
          <option>Friendly</option>
          <option>Short</option>
          <option>Warm</option>
        </select>

        <label>Goal</label>
        <textarea value={form.goal} onChange={(e) => updateForm("goal", e.target.value)} placeholder="Ask for a quick intro call and offer candidates." />

        <label>Upload CV or spreadsheet</label>
        <input type="file" accept=".txt,.csv,.xlsx,.xls,.pdf,.docx" onChange={handleFileUpload} />
        {uploadedFileName && <p className="small">Selected file: {uploadedFileName}</p>}

        <label>Extra context</label>
        <textarea value={form.context} onChange={(e) => updateForm("context", e.target.value)} placeholder="We already spoke with Julia, and Teresa is now the main contact." />

        {error && <p className="small">{error}</p>}

        <div className="actions">
          <button className="primary" onClick={generateMessage} disabled={loading}>
            {loading ? "Generating..." : "Generate"}
          </button>
          <button className="secondary" onClick={() => { setForm(initialForm); setUploadedFileName(""); setSelectedFile(null); }}>Clear</button>
        </div>
      </section>

      <section className="card">
        <h2>Generated message</h2>
        <div className="output">{message || "Your AI-generated message will appear here."}</div>

        <div className="actions">
          <button className="secondary" onClick={() => copyMessage(message)} disabled={!message}>Copy</button>
          <button className="secondary" onClick={handleSaveDraft} disabled={!message}>Save draft</button>
          <a href={form.channel === "Email" ? mailtoLink : linkedInLink} target="_blank">
            <button className="primary" disabled={!message}>Open {form.channel}</button>
          </a>
        </div>

        <div className="draft-list">
          <h3>Saved drafts</h3>
          {drafts.length === 0 && <p className="small">No saved drafts yet.</p>}
          {drafts.map((draft) => (
            <div className="draft-item" key={draft.id}>
              <strong>{draft.recipientName}</strong>
              <p className="small">{draft.channel} · {new Date(draft.createdAt).toLocaleString()}</p>
              <p>{draft.message}</p>
              <div className="actions">
                <button className="secondary" onClick={() => copyMessage(draft.message)}>Copy</button>
                <button className="danger" onClick={() => handleDeleteDraft(draft.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
