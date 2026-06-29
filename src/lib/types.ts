export type Channel = "LinkedIn" | "Email";
export type Tone = "Professional" | "Friendly" | "Short" | "Warm";

export type MessageForm = {
  recipientName: string;
  recipientCompany: string;
  recipientRole: string;
  channel: Channel;
  tone: Tone;
  goal: string;
  context: string;
  fileContext?: string;
};

export type SavedDraft = {
  id: string;
  createdAt: string;
  channel: Channel;
  recipientName: string;
  message: string;
};
