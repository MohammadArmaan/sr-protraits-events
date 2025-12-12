"use client";

export default function Loader() {
    return (
        <div className="w-full h-screen flex items-center justify-center">
            <div className="relative flex items-center justify-center">
                {/* Outer Spinning Ring */}
                <div
                    className="
            w-16 h-16 
            rounded-full 
            border-4 
            border-transparent
            border-t-primary
            border-l-primary
            animate-spin
          "
                    style={{
                        borderImage:
                            "linear-gradient(135deg, hsl(220, 80%, 55%), hsl(180, 70%, 50%)) 1",
                        borderImageSlice: 1,
                    }}
                ></div>

                {/* Inner Glow Dot */}
                <div
                    className="
            absolute w-6 h-6 rounded-full
            bg-gradient-primary
            shadow-lg
            animate-pulse
          "
                ></div>
            </div>
        </div>
    );
}
