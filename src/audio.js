export function createAudio(){
  let enabled=false,context;
  return {
    setEnabled(value){
      enabled=value;
      if(value)try{context||=new (window.AudioContext||window.webkitAudioContext)();context.resume().catch(()=>{});}catch{enabled=false;}
    },
    play(){
      if(!enabled||!context)return;
      try{
        const oscillator=context.createOscillator(),gain=context.createGain();
        oscillator.type='sine';oscillator.frequency.setValueAtTime(660,context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(880,context.currentTime+.12);
        gain.gain.setValueAtTime(.035,context.currentTime);gain.gain.exponentialRampToValueAtTime(.001,context.currentTime+.2);
        oscillator.connect(gain);gain.connect(context.destination);oscillator.start();oscillator.stop(context.currentTime+.22);
        oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
      }catch{/* 音效失敗不阻止遊戲。 */}
    },
    dispose(){context?.close().catch(()=>{});}
  };
}
