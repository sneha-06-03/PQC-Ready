import {
  Send,
  ShieldCheck,
  Lock,
  User,
  Cpu,
  ShieldAlert,
} from "lucide-react";

function SecureChat() {
  const messages = [
    {
      id: 1,
      sender: "Alice",
      message: "Hello Bob! Let's test our quantum-safe communication.",
      time: "10:30 AM",
    },
    {
      id: 2,
      sender: "Bob",
      message: "Sure! Is our secure channel established?",
      time: "10:31 AM",
    },
    {
      id: 3,
      sender: "Alice",
      message: "Yes. The shared secret has been established.",
      time: "10:32 AM",
    },
  ];

  return (
    <div className="p-8 space-y-6">

      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Secure Communication
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Demonstrate post-quantum secure communication between two users.
        </p>
      </div>

      {/* Encryption Status */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center gap-4">
        <div className="bg-green-100 p-3 rounded-lg">
          <ShieldCheck className="text-green-600" size={25} />
        </div>

        <div>
          <h3 className="font-semibold text-green-800">
            Secure Channel Interface
          </h3>
          <p className="text-sm text-green-700 mt-1">
            This is a demonstration interface. Actual encryption will be
            connected to the cryptographic backend.
          </p>
        </div>
      </div>

      {/* Main Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Chat Window */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden">

          {/* Chat Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <User className="text-blue-600" size={22} />
              </div>

              <div>
                <h3 className="font-semibold text-slate-800">
                  Alice ↔ Bob
                </h3>
                <p className="text-xs text-slate-500">
                  Secure communication demo
                </p>
              </div>
            </div>

            <span className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-full">
              <Lock size={14} />
              Demo Mode
            </span>
          </div>

          {/* Messages */}
          <div className="p-6 space-y-5 min-h-[350px] bg-slate-50">

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "Alice"
                    ? "justify-start"
                    : "justify-end"
                }`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-xl shadow-sm ${
                    message.sender === "Alice"
                      ? "bg-white border border-slate-200"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  <div className="flex justify-between gap-6 mb-2">
                    <span className="text-xs font-semibold">
                      {message.sender}
                    </span>

                    <span className="text-xs opacity-70">
                      {message.time}
                    </span>
                  </div>

                  <p className="text-sm">
                    {message.message}
                  </p>
                </div>
              </div>
            ))}

          </div>

          {/* Message Input - Visual Placeholder */}
          <div className="p-4 border-t border-slate-200 flex gap-3">
            <input
              type="text"
              placeholder="Messaging will be enabled after backend integration..."
              disabled
              className="flex-1 bg-slate-100 rounded-lg px-4 py-3 text-sm outline-none"
            />

            <button
              disabled
              className="bg-blue-300 text-white px-5 rounded-lg cursor-not-allowed"
            >
              <Send size={19} />
            </button>
          </div>

        </div>

        {/* Encryption Details */}
        <div className="space-y-5">

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-blue-50 p-3 rounded-lg">
                <Cpu className="text-blue-600" size={22} />
              </div>

              <h3 className="font-semibold text-slate-800">
                Cryptographic Details
              </h3>
            </div>

            <div className="space-y-4">

              <div>
                <p className="text-xs text-slate-500">Key Establishment</p>
                <p className="font-semibold text-sm text-slate-800 mt-1">
                  ML-KEM-768
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Message Encryption</p>
                <p className="font-semibold text-sm text-slate-800 mt-1">
                  AES-256-GCM
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Key Size</p>
                <p className="font-semibold text-sm text-slate-800 mt-1">
                  256-bit shared secret
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">Connection Status</p>
                <p className="font-semibold text-sm text-amber-600 mt-1">
                  Demo Only
                </p>
              </div>

            </div>
          </div>

          {/* Attacker View */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <ShieldAlert className="text-red-500" size={22} />
              <h3 className="font-semibold text-slate-800">
                Attacker's View
              </h3>
            </div>

            <p className="text-sm text-slate-500">
              This panel will display captured ciphertext once the actual
              encryption and communication backend is connected.
            </p>

            <div className="mt-4 bg-slate-950 rounded-lg p-4">
              <p className="text-xs text-green-400 font-mono">
                Waiting for encrypted data...
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default SecureChat;