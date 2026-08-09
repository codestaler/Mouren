import { useRef, useState } from "react";

export default function IntroScreen({ slide, index, total, onNext }) {
  const videoRef = useRef(null);
  const [pausado, setPausado] = useState(false);
  const [silenciado, setSilenciado] = useState(true);

  if (!slide) return null;

  const esVideo = slide.imagen?.toLowerCase().endsWith(".mp4");

  const toggleVideo = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setPausado(false);
    } else {
      video.pause();
      setPausado(true);
    }
  };

  const toggleSonido = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setSilenciado(video.muted);
  };

  return (
    <div
      onClick={onNext}
      style={{
        position: "absolute", inset: 0, zIndex: 50, background: "#000",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        cursor: "pointer", padding: 20, textAlign: "center",
      }}
    >
      {slide.imagen && (
        esVideo ? (
          <div style={{ position: "relative", maxWidth: "92%", maxHeight: "62%", marginBottom: 22 }}>
            <video
              ref={videoRef}
              src={slide.imagen}
              autoPlay
              muted
              playsInline
              onClick={toggleVideo}
              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 12, boxShadow: "0 8px 30px rgba(0,0,0,.6)", display: "block" }}
            />
            {pausado && (
              <div
                onClick={toggleVideo}
                style={{
                  position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 48, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,.7)",
                }}
              >
                ▶
              </div>
            )}
            <div
              onClick={toggleSonido}
              style={{
                position: "absolute", bottom: 8, right: 8, width: 34, height: 34,
                background: "rgba(0,0,0,.55)", borderRadius: "50%", display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: 16, color: "#fff",
              }}
            >
              {silenciado ? "🔇" : "🔊"}
            </div>
          </div>
        ) : (
          <img
            src={slide.imagen} alt=""
            style={{ maxWidth: "92%", maxHeight: "62%", objectFit: "contain", borderRadius: 12, boxShadow: "0 8px 30px rgba(0,0,0,.6)", marginBottom: 22 }}
          />
        )
      )}
      {slide.texto && (
        <p style={{ color: "#f3ecd8", fontSize: 17, lineHeight: 1.6, maxWidth: 620, margin: 0 }}>
          {slide.texto}
        </p>
      )}
      <div style={{ color: "#c9bfa2", fontSize: 12, marginTop: 22, opacity: .8 }}>
        {esVideo ? "clic en el video: pausa · icono: sonido · " : ""}
        {index + 1}/{total} · clic fuera del video o ENTER para continuar ▸
      </div>
    </div>
  );
}