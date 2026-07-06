"use client";

import { createPortal } from "react-dom";
import { Mic, MicOff, Phone, PhoneOff, Video, VideoOff } from "lucide-react";
import type { ActiveCall, CallType, IncomingCall } from "@/hooks/use-webrtc";

function RingingAvatar({
  name,
  callType,
  variant = "incoming",
}: {
  name: string;
  callType: CallType;
  variant?: "incoming" | "outgoing";
}) {
  const initial = name?.[0]?.toUpperCase() || "?";
  const isIncoming = variant === "incoming";

  return (
    <div className="relative mx-auto mb-8 h-36 w-36">
      <span
        className={`absolute inset-0 animate-ping rounded-full opacity-30 ${
          isIncoming ? "bg-emerald-400" : "bg-doora-orange"
        }`}
      />
      <div
        className={`relative z-10 flex h-full w-full flex-col items-center justify-center rounded-full text-white shadow-2xl ${
          isIncoming
            ? "bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600"
            : "bg-gradient-to-br from-doora-orange via-doora-orange to-doora-navy-dark"
        }`}
      >
        <span className="text-4xl font-bold">{initial}</span>
        <span className="mt-1 opacity-90">
          {callType === "video" ? <Video className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
        </span>
      </div>
    </div>
  );
}

export function CallOverlay({
  callState,
  incomingCall,
  activeCall,
  isMuted,
  isVideoOff,
  localVideoRef,
  remoteVideoRef,
  onAccept,
  onReject,
  onEnd,
  onToggleMute,
  onToggleVideo,
}: {
  callState: string;
  incomingCall: IncomingCall | null;
  activeCall: ActiveCall | null;
  isMuted: boolean;
  isVideoOff: boolean;
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  onAccept: () => void;
  onReject: () => void;
  onEnd: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
}) {
  if (callState === "idle") return null;

  let content: React.ReactNode = null;

  if (callState === "ringing" && incomingCall) {
    content = (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 p-4">
        <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900/80 p-8 text-center backdrop-blur-xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-300">
            Incoming {incomingCall.callType} call
          </p>
          <RingingAvatar name={incomingCall.fromName} callType={incomingCall.callType} />
          <h3 className="text-2xl font-semibold text-white">{incomingCall.fromName}</h3>
          <p className="mt-2 text-sm text-slate-400">Ringing…</p>
          <div className="mt-10 flex justify-center gap-4">
            <button
              type="button"
              onClick={onReject}
              className="flex min-w-[100px] flex-col items-center gap-2 rounded-2xl bg-red-600 px-6 py-4 text-white hover:bg-red-500"
            >
              <PhoneOff className="h-7 w-7" />
              <span className="text-sm font-semibold">Decline</span>
            </button>
            <button
              type="button"
              onClick={onAccept}
              className="flex min-w-[100px] flex-col items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 text-white hover:bg-emerald-500"
            >
              <Phone className="h-7 w-7" />
              <span className="text-sm font-semibold">Accept</span>
            </button>
          </div>
        </div>
      </div>
    );
  } else if (activeCall) {
    const isVideo = activeCall.callType === "video";
    const isCalling = callState === "calling";
    const isConnected = callState === "connected";
    const statusText = isCalling ? "Calling" : isConnected ? "Connected" : "Connecting";

    content = (
      <div className="fixed inset-0 z-[100] flex h-[100dvh] flex-col bg-slate-950">
        <div className="relative min-h-0 flex-1">
          {isVideo && isConnected ? (
            <>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="absolute inset-0 h-full w-full bg-black object-cover"
              />
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="absolute bottom-24 right-4 z-10 h-28 w-36 rounded-xl border-2 border-slate-600 object-cover shadow-lg sm:h-28 sm:w-40"
              />
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center">
              {isCalling ? (
                <RingingAvatar
                  name={activeCall.targetName}
                  callType={activeCall.callType}
                  variant="outgoing"
                />
              ) : (
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-doora-orange to-doora-navy-dark shadow-xl">
                  <span className="text-3xl font-bold text-white">
                    {activeCall.targetName?.[0]?.toUpperCase() || "?"}
                  </span>
                </div>
              )}
              <h3 className="text-2xl font-semibold text-white">{activeCall.targetName}</h3>
              <p
                className={`mt-2 text-sm font-medium ${isConnected ? "text-emerald-400" : "text-slate-400"}`}
              >
                {statusText}
              </p>
              <audio ref={remoteVideoRef} autoPlay playsInline className="hidden" />
            </div>
          )}

          <div className="absolute top-4 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/10 bg-black/50 px-4 py-2 backdrop-blur-md">
            <span className="text-sm font-medium text-white">
              {activeCall.targetName} · {statusText}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-center gap-5 border-t border-slate-700/50 bg-slate-900/95 px-6 py-5 pb-8">
          <button
            type="button"
            onClick={onToggleMute}
            className={`rounded-full p-4 transition ${
              isMuted ? "bg-red-500/20 text-red-400" : "bg-slate-700 text-white hover:bg-slate-600"
            }`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </button>

          {isVideo && (
            <button
              type="button"
              onClick={onToggleVideo}
              className={`rounded-full p-4 transition ${
                isVideoOff
                  ? "bg-red-500/20 text-red-400"
                  : "bg-slate-700 text-white hover:bg-slate-600"
              }`}
              title={isVideoOff ? "Turn on camera" : "Turn off camera"}
            >
              {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
            </button>
          )}

          <button
            type="button"
            onClick={onEnd}
            className="flex items-center gap-2 rounded-full bg-red-600 px-6 py-4 text-white hover:bg-red-500"
          >
            <PhoneOff className="h-6 w-6" />
            <span className="text-sm font-semibold">End</span>
          </button>
        </div>
      </div>
    );
  }

  if (!content) return null;
  return createPortal(content, document.body);
}
