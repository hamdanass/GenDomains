import { GlowCard } from "@/components/ui/spotlight-card";

export function Default(){
  return(
    <div className="w-screen h-screen flex flex-row items-center justify-center gap-10 custom-cursor">
      <GlowCard>
        <div className="flex flex-col items-center justify-center h-full text-white">
          <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" alt="Abstract" className="w-24 h-24 rounded-full mb-4 object-cover" />
          <h3 className="text-xl font-bold">Feature One</h3>
          <p className="text-sm text-gray-300 text-center mt-2">Premium glassmorphism aesthetics</p>
        </div>
      </GlowCard>
      
      <GlowCard glowColor="purple">
        <div className="flex flex-col items-center justify-center h-full text-white">
          <img src="https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2670&auto=format&fit=crop" alt="3D Render" className="w-24 h-24 rounded-full mb-4 object-cover" />
          <h3 className="text-xl font-bold">Feature Two</h3>
          <p className="text-sm text-gray-300 text-center mt-2">Interactive hover effects</p>
        </div>
      </GlowCard>

      <GlowCard glowColor="green">
        <div className="flex flex-col items-center justify-center h-full text-white">
          <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop" alt="Cyberpunk" className="w-24 h-24 rounded-full mb-4 object-cover" />
          <h3 className="text-xl font-bold">Feature Three</h3>
          <p className="text-sm text-gray-300 text-center mt-2">Dynamic neon spotlight tracking</p>
        </div>
      </GlowCard>
    </div>
  );
};
