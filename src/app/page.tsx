import MessageGenerator from "@/components/MessageGenerator";

export default function Home() {
  return (
    <main className="container">
      <section className="hero">
        <span className="badge">PingPilot</span>
        <h1>AI outreach messages in seconds</h1>
        <p className="subtitle">
          Generate, save, copy, and send personalized LinkedIn or email messages for recruiting, sales, partnerships, and follow-ups.
        </p>
      </section>
      <MessageGenerator />
    </main>
  );
}
