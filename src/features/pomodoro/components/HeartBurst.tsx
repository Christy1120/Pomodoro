import React from "react";
import { motion } from "framer-motion";

export default function HeartBurst() {
  const hearts = Array.from({ length: 6 });
  return (
    <div className="pointer-events-none absolute left-1/2 top-[76px] -translate-x-1/2 -translate-y-1/2">
      {hearts.map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 0, scale: 0.6, rotate: 0, x: (i - 3) * 8 }}
          animate={{ opacity: [0, 1, 0], y: -40 - Math.random() * 20, scale: 1, rotate: (i - 2) * 12 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#f43f5e">
            <path d="M12 21s-6.716-4.09-9.192-7.03C.332 10.13 2.24 6 6.272 6 8.4 6 10 7.41 12 9.5 14 7.41 15.6 6 17.728 6c4.032 0 5.94 4.13 3.464 7.97C18.716 16.91 12 21 12 21z"/>
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
