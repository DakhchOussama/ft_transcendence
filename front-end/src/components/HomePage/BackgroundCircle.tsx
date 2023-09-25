import { motion } from "framer-motion";

function BackgroundCircle() {
  return (
    <motion.div
      className="absolute flex justify-center items-center mt-[12rem] ml-[6rem]"
      initial={{
        opacity: 0,
      }}
      animate={{
        scale: [1, 2, 2, 3, 1],
        opacity: [0.2, 0.4, 0.6, 0.8, 0.1, 1.0],
      }}
      transition={{
        duration: 5.5,
      }}
    >
      <div className="absolute border border-[#DA343E] rounded-full h-[800px] w-[800px] animate-ping"></div>
      <div className="absolute border border-slate-500 rounded-full h-[600px] w-[600px] animate-ping"></div>
      <div className="absolute border border-slate-500 rounded-full h-[400px] w-[400px] animate-ping"></div>
      <div className="absolute border border-slate-500 rounded-full h-[200px] w-[200px] animate-ping"></div>
      <div className="absolute border border-slate-500 rounded-full h-[200px] w-[200px]"></div>
      <div className="absolute border border-slate-500 rounded-full h-[300px] w-[300px]"></div>
    </motion.div>
  );
}

export default BackgroundCircle;
